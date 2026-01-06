import {
  Bell,
  ExternalLink,
  Globe,
  Hospital,
  Instagram,
  Mail,
  NotepadText,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

import { logout } from '@/app/(auth)/actions';
import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getMyReminders, type ReminderDisplay } from '@/app/(main)/reminders/actions';
import { HedgehogSwitcher } from '@/components/hedgehogs/hedgehog-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { HomeAlerts } from './home-alerts';
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

        {/* Temporary Bucket Creation Button */}
        <button
          onClick={async () => {
            try {
              // 1. セッションからトークンを取得（SupabaseクライアントがCookieに保存している場合）
              const cookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('sb-aqvhaxxeswmpxthepxby-auth-token='));
              if (!cookie) {
                alert('No auth cookie found');
                return;
              }
              const base64Value = cookie.split('=')[1].replace('base64-', '');
              const session = JSON.parse(atob(base64Value));
              const token = session.access_token;

              // 2. バケット作成APIを叩く
              const projectId = 'aqvhaxxeswmpxthepxby';
              const response = await fetch(`https://${projectId}.supabase.co/storage/v1/bucket`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  apikey: token,
                },
                body: JSON.stringify({
                  id: 'hedgehog-images',
                  name: 'hedgehog-images',
                  public: true,
                  file_size_limit: 5242880,
                  allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'],
                }),
              });

              if (response.ok) {
                alert('Bucket created successfully!');
              } else {
                const err = await response.json();
                alert('Failed: ' + JSON.stringify(err));
              }
            } catch (e) {
              alert('Error: ' + e);
            }
          }}
          className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
          id="create-bucket-btn" // IDを追加してセレクタで特定しやすくする
        >
          [DEBUG] Create Bucket
        </button>
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
                {activeHedgehog.imageUrl ? (
                  <img
                    src={activeHedgehog.imageUrl}
                    alt={activeHedgehog.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  '🦔'
                )}
              </div>
            </div>
          </div>

          <div className="mt-14 ml-4 flex flex-col gap-2 sm:mt-2 sm:ml-32 sm:flex-row sm:items-start sm:justify-between">
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
            <NotepadText className="h-8 w-8 text-[var(--color-primary)]" />
            <span className="font-bold text-stone-700">今日の記録</span>
          </Button>
        </Link>
        <Link href={`/hospital/entry`} className="block">
          <Button
            variant="outline"
            className="flex h-24 w-full flex-col gap-2 border-green-100 bg-green-50/50 hover:border-green-200 hover:bg-green-100/50"
          >
            <Hospital className="h-8 w-8 text-[var(--color-accent)]" />
            <span className="font-bold text-stone-700">通院メモ</span>
          </Button>
        </Link>
      </div>

      {/* Alerts Section (New) */}
      <HomeAlerts hedgehogId={activeHedgehog.id} />

      {/* Reminders / ToDo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-stone-700">
            <Bell className="h-5 w-5 fill-yellow-400 text-yellow-600" /> やることリスト
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
            {reminders.map((reminder: ReminderDisplay) => (
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
                <Instagram className="h-5 w-5" />
              </div>
              <span className="font-bold text-stone-600">ハリネズミ協会インスタグラム</span>
            </div>
            <ExternalLink className="h-4 w-4 text-stone-400" />
          </Card>
        </a>

        <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Card className="flex items-center justify-between border-green-100 p-4 transition-colors hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Globe className="h-5 w-5" />
              </div>
              <span className="font-bold text-stone-600">ハリネズミ協会WEBサイト</span>
            </div>
            <ExternalLink className="h-4 w-4 text-stone-400" />
          </Card>
        </a>

        <div className="mt-6 text-center">
          <p className="mb-2 text-xs text-stone-400">お問い合わせはこちら</p>
          <a
            href={`mailto:${MAIL_ADDRESS}`}
            className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-200"
          >
            <Mail className="h-4 w-4" />
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
