import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needed to delete users if we want cleanup, or use admin auth

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase env variables');
  process.exit(1);
}

// Use Service Role if available for admin tasks, otherwise fall back to client (might fail to delete user)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

async function setupLimitTest() {
  // Fixed user to avoid rate limits
  const email = `hariness_limit_test_fixed_v1@example.com`;
  const password = 'password123';

  if (!SERVICE_ROLE_KEY) {
    console.warn('⚠️ No Service Role Key found. Rate limits might apply.');
  }

  console.log(`\n🔹 Creating/Getting User via Admin: ${email}`);

  // Try to get user by email first (Admin API)
  // Note: listUsers is pagination based, generic search not always easy, but createUser with same email might throw specific error or we can just try creating.

  // Using admin.createUser
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let user = adminData.user;

  if (adminError) {
    console.log(`Admin Create Error: ${adminError.message}`);
    // If user already exists, we can't easily get their ID without signing in, but signIn might fail if we don't know password (though we set it).
    // Let's try signIn again if create failed (likely "User already registered")
    if (adminError.message.includes('already registered')) {
      console.log('User exists, signing in...');
      const signInRes = await supabase.auth.signInWithPassword({ email, password });
      if (signInRes.error) {
        console.error('SignIn failed even though user exists:', signInRes.error.message);
        return;
      }
      user = signInRes.data.user;
    } else {
      return;
    }
  }

  if (!user) {
    console.error('❌ No user returned.');
    return;
  }

  const userId = user.id;
  console.log(`✅ User Created: ${userId}`);

  // Need a client authenticated as this user to insert rows (if RLS is on) OR use Service Role to bypass
  // Using Service Role (supabase variable above) simplifies this to bypass RLS

  console.log(`\n🔹 Inserting 10 Hedgehogs...`);
  const hedgehogs = Array.from({ length: 10 }, (_, i) => ({
    user_id: userId,
    name: `LimitTester ${i + 1}`,
    gender: i % 2 === 0 ? 'male' : 'female',
    birth_date: '2025-01-01',
    welcome_date: '2025-01-01',
  }));

  const { error: insertError } = await supabase.from('hedgehogs').insert(hedgehogs);

  if (insertError) {
    console.error('❌ Insert Error:', insertError.message);
  } else {
    console.log('✅ Successfully inserted 10 hedgehogs.');
    console.log(`\n📋 Test Credentials:\nEmail: ${email}\nPassword: ${password}`);
    console.log('\nPlease use these credentials in the browser to test the 11th registration.');
  }
}

setupLimitTest();
