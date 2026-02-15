import Link from 'next/link';

import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '認証エラー',
  description: 'メール認証でエラーが発生しました。',
};

/**
 * 認証コードエラーページ
 * メール認証リンクが無効・期限切れの場合に表示
 */
export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="mb-2 text-xl font-bold text-[#5D5D5D]">認証エラー</h1>
        <p className="mb-6 text-sm text-[#5D5D5D]/70">
          メール認証リンクが無効または期限切れです。
          <br />
          お手数ですが、もう一度お試しください。
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-[#FFB370] px-6 py-3 font-bold text-white transition hover:bg-[#FFA050]"
          >
            新規登録に戻る
          </Link>
          <Link
            href="/login"
            className="text-sm text-[#5D5D5D]/60 hover:text-[#5D5D5D] hover:underline"
          >
            ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
