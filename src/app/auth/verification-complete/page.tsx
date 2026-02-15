import { type Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'メール認証完了',
  description: 'メール認証が完了しました。',
};

export default async function VerificationCompletePage() {
  // Browser opened from email link should not keep an active session.
  const supabase = await createClient();
  await supabase.auth.signOut();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
        <div className="mb-4 text-4xl">✅</div>
        <h1 className="mb-2 text-xl font-bold text-[#5D5D5D]">メール認証が完了しました</h1>
        <p className="text-sm leading-relaxed text-[#5D5D5D]/80">
          この画面を閉じて、ホーム画面のHarinessアプリアイコンから開いてください。
          <br />
          その後、ログインして利用を開始できます。
        </p>
      </div>
    </div>
  );
}
