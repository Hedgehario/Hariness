import { Settings } from 'lucide-react';
import Link from 'next/link';

import { logout } from '@/app/(auth)/actions';
import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getMyReminders } from '@/app/(main)/reminders/actions';
import { HedgehogSwitcher } from '@/components/hedgehogs/hedgehog-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { HomeReminderItem } from './home-reminder-item';

const INSTAGRAM_URL = 'https://www.instagram.com/';
const WEB_URL = 'https://www.hedgehog.or.jp/';
const MAIL_ADDRESS = 'harinezumi@xxx.com';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ホーム',
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const hedgehogs = await getMyHedgehogs();
  const reminders = await getMyReminders();
  const { hedgehogId } = await searchParams;

  // 個体が登録されていない場合
  if (hedgehogs.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
        <div className="text-4xl">🦔</div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">ようこそ Harinessへ</h1>
        <p className="text-center text-gray-600">
          まずはあなたのハリネズミちゃんを登録しましょう！
        </p>
        <Link href="/hedgehogs/new">
          <Button size="lg" className="rounded-full px-8 shadow-lg">
            個体を登録する
          </Button>
        </Link>
        <form action={logout}>
          <Button variant="ghost" className="text-sm text-gray-400">
            ログアウト
          </Button>
        </form>
      </div>
    );
  }

  // メインの個体（選択されたID or 最初の1匹）
  const activeHedgehog = hedgehogs.find((h) => h.id === hedgehogId) || hedgehogs[0];

  return (
    <div className="space-y-6 p-4">
      {/* Hedgehog Card */}
      <Card className="overflow-hidden border-none bg-white shadow-md">
        <div className="relative h-32 bg-[var(--color-primary)]/20">
          {/* 背景装飾（後で画像にする） */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
            🌿
          </div>
          {/* Switcher & Edit Button */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <HedgehogSwitcher hedgehogs={hedgehogs} activeId={activeHedgehog.id} />
          </div>
        </div>
        <CardHeader className="relative pt-0 pb-2">
          <div className="absolute -top-12 left-6">
            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-stone-200 text-4xl">
                {/* 画像があれば表示、なければ絵文字 */}
                🦔
              </div>
            </div>
          </div>

          <div className="mt-2 ml-32 flex items-start justify-between">
            <div>
              <CardTitle className="mb-1 text-2xl font-bold">{activeHedgehog.name}</CardTitle>
              <div className="flex gap-2 text-sm text-gray-500">
                <span>
                  {activeHedgehog.gender === 'male'
                    ? '♂ 男の子'
                    : activeHedgehog.gender === 'female'
                      ? '♀ 女の子'
                      : '性別不明'}
                </span>
                <span>•</span>
                <span>
                  {activeHedgehog.birth_date
                    ? `${calculateAge(activeHedgehog.birth_date)}`
                    : '年齢不詳'}
                </span>
              </div>
            </div>
            <Link href={`/hedgehogs/${activeHedgehog.id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-stone-400 hover:text-[var(--color-primary)]"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="line-clamp-2 text-sm text-gray-600">
            {activeHedgehog.features || '特徴はまだ登録されていません。'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href={`/records/${activeHedgehog.id}/entry`} className="block">
          <Button
            variant="outline"
            className="flex h-24 w-full flex-col gap-2 border-orange-100 bg-orange-50/50 hover:border-orange-200 hover:bg-orange-100/50"
          >
            <span className="text-3xl">📝</span>
            <span className="font-bold text-stone-700">今日の記録</span>
          </Button>
        </Link>
        <Link href={`/hospital/entry`} className="block">
          <Button
            variant="outline"
            className="flex h-24 w-full flex-col gap-2 border-green-100 bg-green-50/50 hover:border-green-200 hover:bg-green-100/50"
          >
            <span className="text-3xl">🏥</span>
            <span className="font-bold text-stone-700">通院メモ</span>
          </Button>
        </Link>
      </div>

      {/* Reminders / ToDo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-stone-700">
            <span>🔔</span> やることリスト
          </h2>
          <Link href="/reminders">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-[var(--color-primary)]">
              編集・一覧
            </Button>
          </Link>
        </div>

        {reminders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-stone-100 bg-white/50 p-6 text-center text-sm text-gray-500">
            <p>今日のリマインダーはありません</p>
            <Link href="/reminders/entry">
              <Button size="sm" variant="outline" className="h-8 rounded-full text-xs">
                追加する
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder: any) => (
              <HomeReminderItem key={reminder.id} reminder={reminder} />
            ))}
            <div className="pt-2 text-center">
              <Link href="/reminders/entry">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-[var(--color-primary)]"
                >
                  + 新しいリマインダーを追加
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="mt-8 flex flex-col gap-4 border-t border-stone-100 pt-8 pb-4">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Card className="flex items-center justify-between border-orange-100 p-4 transition-colors hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <span className="font-bold text-stone-600">ハリネズミ協会インスタグラム</span>
            </div>
            <span className="text-stone-400">👋</span>
          </Card>
        </a>

        <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Card className="flex items-center justify-between border-green-100 p-4 transition-colors hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <span className="font-bold text-stone-600">ハリネズミ協会WEBサイト</span>
            </div>
            <span className="text-stone-400">🌐</span>
          </Card>
        </a>

        <div className="mt-6 text-center">
          <p className="mb-2 text-xs text-stone-400">お問い合わせはこちら</p>
          <a
            href={`mailto:${MAIL_ADDRESS}`}
            className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            {MAIL_ADDRESS}
          </a>
        </div>
      </div>
    </div>
  );
}

// ... helper functions
function calculateAge(birthDateStr: string) {
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // 0歳なら月齢も表示したいが、一旦「X歳」で
  if (age === 0) {
    let months =
      (today.getFullYear() - birthDate.getFullYear()) * 12 +
      (today.getMonth() - birthDate.getMonth());
    if (today.getDate() < birthDate.getDate()) months--;
    return `${months}ヶ月`;
  }

  return `${age}歳`;
}
