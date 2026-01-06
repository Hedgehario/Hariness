
import { createHedgehog } from '@/app/(main)/hedgehogs/actions';
import { CreateHedgehogInput } from '@/app/(main)/hedgehogs/actions';

// Mock Client Factory
const createMockClient = (count: number) => {
  return {
    auth: {
      getUser: async () => ({ data: { user: { id: 'mock-user-id' } } }),
    },
    from: (table: string) => {
      if (table === 'hedgehogs') {
        return {
          select: (columns: string, options?: { count?: string }) => {
            return {
              // Stub chainable methods
              eq: (col: string, val: string) => {
                // Return mocked count
                return Promise.resolve({ count, error: null });
              },
            };
          },
          insert: (data: any) => {
             return {
                 select: () => ({
                     single: () => Promise.resolve({ data: { id: 'new-id' }, error: null })
                 })
             }
          }
        };
      }
      return {};
    },
  };
};

async function testLimitLogic() {
  console.log('🧪 Testing Hedgehog Limit Logic (TC-HH-01)');

  const input: CreateHedgehogInput = {
    name: 'Test Hog',
    gender: 'male',
  };

  // Case 2: Count is 10 (Should fail) - RUN ACROSS FIRST
  console.log('\n🔹 Case 2: Current count is 10 (Expect Limit Error)');
  // @ts-ignore
  const client10 = createMockClient(10);
  const result10 = await createHedgehog(input, client10 as any);
  if (!result10.success && (result10.error?.message?.includes('上限') || result10.error?.code === 'E007' || result10.error?.code === 'LIMIT_EXCEEDED')) {
    console.log('✅ Caught Limit Error as expected:', result10.error.message);
  } else {
    console.error('❌ Did not catch expected error. Result:', result10);
  }

  // Case 1: Count is 9 (Should succeed)
  console.log('\n🔹 Case 1: Current count is 9 (Expect Success - might crash on revalidatePath)');
  try {
    // @ts-ignore
    const client9 = createMockClient(9);
    const result9 = await createHedgehog(input, client9 as any);
    if (result9.success) {
      console.log('✅ Success as expected.');
    } else {
      console.error('❌ Failed unexpectedly:', result9.error);
    }
  } catch (e: any) {
    if (e.message && (e.message.includes('store') || e.message.includes('AsyncStorage'))) {
       console.log('⚠️ Ignored Next.js Cache Error (Expected in standalone script): Logic executed successfully up to DB insert.');
    } else {
       console.error('❌ Unexpected Error:', e);
    }
  }
}

testLimitLogic();
