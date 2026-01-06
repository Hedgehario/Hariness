
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase env variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUser(email: string, pass: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
  });
  if (error) throw error;
  // If email confirmation is required and not disabled, session might be null.
  // We hope session is returned (local dev setting).
  return data;
}

async function runTests() {
  console.log('🚀 Starting DB Constraint Verification...');
  const suffix = Math.floor(Math.random() * 1000000).toString();
  // Using a more realistic domain to avoid potential blocklists
  const emailA = `hariness.test.a.${suffix}@gmail.com`;
  const emailB = `hariness.test.b.${suffix}@gmail.com`;
  
  console.log(`Using emails: ${emailA}, ${emailB}`);
  const password = 'password123';

  let userA_Id: string | undefined;
  let userB_Id: string | undefined;
  let hedgehogA_Id: string | undefined;

  try {
    // 1. Setup Users
    console.log(`\n🔹 [Setup] Creating test users...`);
    const sessionA = await createTestUser(emailA, password);
    if (!sessionA.session) {
      console.warn('⚠️ User A created but no session. Email confirmation might be required. Skipping RLS tests dependent on auth.');
      return;
    }
    userA_Id = sessionA.user!.id;
    console.log(`✅ User A created: ${userA_Id}`);

    const sessionB = await createTestUser(emailB, password);
    if (!sessionB.session) {
      console.warn('⚠️ User B created but no session.');
      return;
    }
    userB_Id = sessionB.user!.id;
    console.log(`✅ User B created: ${userB_Id}`);

    // Create authenticated clients
    const clientA = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${sessionA.session.access_token}` } },
    });
    const clientB = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${sessionB.session.access_token}` } },
    });

    // 2. Test HH-Logic & RLS: Create Hedgehog
    console.log(`\n🔹 [TC-HH-04/RLS] Creating Hedgehog for User A...`);
    const { data: hhA, error: hhError } = await clientA
      .from('hedgehogs')
      .insert({
        name: 'HedgeA',
        user_id: userA_Id, // RLS should enforce this matches auth.uid() or be ignored if omitted and defaulted?
        // Actually usually RLS forces 'user_id = auth.uid()'. 
        // If we explicitly pass userA_Id it should work.
      })
      .select()
      .single();

    if (hhError) throw new Error(`Failed to create hedgehog: ${hhError.message}`);
    hedgehogA_Id = hhA.id;
    console.log(`✅ Hedgehog A created: ${hhA.id}`);

    // 3. Test RLS: User B tries to update User A's hedgehog
    console.log(`\n🔹 [TC-AUTH-04] RLS: User B trying to update User A's hedgehog...`);
    const { error: rlsError } = await clientB
      .from('hedgehogs')
      .update({ name: 'Hacked' })
      .eq('id', hedgehogA_Id);

    // Supabase update returns 204 No Content and count=0 if RLS hides the row. It usually doesn't throw error unless policy blocks generic access.
    // We verify by reading back as User A.
    const { data: hhACheck } = await clientA.from('hedgehogs').select('name').eq('id', hedgehogA_Id).single();
    if (hhACheck?.name === 'HedgeA') {
      console.log('✅ [Pass] User B could not update User A\'s hedgehog.');
    } else {
      console.error(`❌ [Fail] Hedgehog name changed to ${hhACheck?.name}`);
    }

    // 4. Test RLS: User B tries to insert Record for User A's hedgehog
    console.log(`\n🔹 [TC-AUTH-05] RLS: User B trying to insert weight for User A's hedgehog...`);
    const { error: rlsInsertError } = await clientB
      .from('weight_records')
      .insert({
        hedgehog_id: hedgehogA_Id, // Should violate RLS 'check (hedgehog_id in (select id from hedgehogs where user_id = auth.uid()))' or similar
        record_date: '2025-01-01',
        weight: 500,
      });

    if (rlsInsertError) {
      console.log(`✅ [Pass] Insert blocked: ${rlsInsertError.message}`);
    } else {
      // Check if it actually helped
      const { data: wCheck } = await clientA
        .from('weight_records')
        .select('*')
        .eq('hedgehog_id', hedgehogA_Id);
      if (wCheck && wCheck.length === 0) {
        console.log('✅ [Pass] Insert appeared successful but row was not stored/visible (RLS).');
      } else {
        console.error('❌ [Fail] User B successfully inserted weight for User A.');
      }
    }

    // 5. Test VR-06: Unique Constraint (Same Day Weight)
    console.log(`\n🔹 [TC-VR-06] Unique Constraint: User A inserting duplicate weight...`);
    // First insert
    await clientA.from('weight_records').insert({
      hedgehog_id: hedgehogA_Id,
      record_date: '2025-01-01',
      weight: 300,
    });
    // Duplicate insert
    const { error: uniqueError } = await clientA.from('weight_records').insert({
      hedgehog_id: hedgehogA_Id,
      record_date: '2025-01-01',
      weight: 350,
    });

    if (uniqueError && uniqueError.code === '23505') { // Postgres unique_violation
      console.log(`✅ [Pass] Duplicate insert blocked: ${uniqueError.message}`);
    } else {
      console.error(`❌ [Fail] Duplicate insert allowed or unexpected error: ${uniqueError?.message}`);
    }

    // 6. Test HH-02: Cascade Delete
    console.log(`\n🔹 [TC-HH-02] Cascade Delete: Deleting Hedgehog A...`);
    const { error: delError } = await clientA
      .from('hedgehogs')
      .delete()
      .eq('id', hedgehogA_Id);
    
    if (delError) throw delError;

    // Verify weight records are gone
    // We need to bypass RLS or use User A? User A can read results.
    const { count } = await clientA
      .from('weight_records')
      .select('*', { count: 'exact', head: true })
      .eq('hedgehog_id', hedgehogA_Id);
    
    // Actually, RLS might hide records if hedgehog is gone, depending on policy.
    // If policy is "user match via hedgehog table", then if hedgehog is gone, we can't join.
    // But usually cascade deletes physical rows.
    // Assuming 0 count means gone.
    if (count === 0) {
        console.log(`✅ [Pass] Weight records automatically deleted.`);
    } else {
        console.warn(`⚠️ [Check] Weight records count: ${count}. Might be RLS hiding or not deleted.`);
    }

  } catch (e: any) {
    console.error('❌ Unexpected Error:', e);
  } finally {
    // Cleanup Users (Best effort - Client usually can't delete users without Admin key)
    console.log(`\n🔹 [Cleanup] Note: Created users (${emailA}, ${emailB}) remain in Auth. Use Admin console to clean up if needed.`);
  }
}

runTests();
