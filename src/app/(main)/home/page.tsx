import {
  Bell,
  ExternalLink,
  Globe,
  Hospital,
  Instagram,
  Mail,
  NotepadText,
  Settings,
  Edit2,
  Cake,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { logout } from '@/app/(auth)/actions';
import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getMyReminders, type ReminderDisplay } from '@/app/(main)/reminders/actions';
import { HedgehogSwitcher } from '@/components/hedgehogs/hedgehog-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { HomeAlerts } from './home-alerts';
import { HomeReminderItem } from './home-reminder-item';

const INSTAGRAM_URL = 'https://www.instagram.com/jha._p.hedgehog.jp/';
const WEB_URL = 'https://www.p-hedgehog.com/';
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
  // 並列データフェッチ（ウォーターフォール防止）
  const [hedgehogs, reminders, params] = await Promise.all([
    getMyHedgehogs(),
    getMyReminders(),
    searchParams,
  ]);
  const { hedgehogId } = params;

  // ハリネズミが登録されていない場合
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
            ハリネズミを登録する
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

  // メインのハリネズミ（選択されたID or 最初の1匹）
  const activeHedgehog = hedgehogs.find((h) => h.id === hedgehogId) || hedgehogs[0];

  return (
    <div className="space-y-6 p-4">
      {/* Hedgehog Card */}
      <Card className="overflow-hidden border-none bg-white shadow-lg">
        <div className="flex items-start gap-4 p-4 sm:gap-5 sm:p-5">
          {/* Avatar (Left) */}
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-white p-1 shadow-md sm:h-24 sm:w-24">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-stone-200 text-3xl">
              {activeHedgehog.imageUrl ? (
                <Image
                  src={activeHedgehog.imageUrl}
                  alt={activeHedgehog.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                '🦔'
              )}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex flex-1 flex-col gap-3">
            {/* Row 1: Name & Edit (Full Width) */}
            <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-stone-700 sm:text-2xl">
                  {activeHedgehog.name.length > 8
                    ? `${activeHedgehog.name.slice(0, 8)}...`
                    : activeHedgehog.name}
                </CardTitle>
                <Link href={`/hedgehogs/${activeHedgehog.id}/edit`} className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-300 hover:bg-stone-100 hover:text-[var(--color-primary)]"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </Link>
            </div>

            {/* Row 2: Badges (Unified) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm font-bold text-stone-600">
                <span>
                  {activeHedgehog.gender === 'male'
                    ? '♂'
                    : activeHedgehog.gender === 'female'
                      ? '♀'
                      : '?'}
                </span>
                <span className="whitespace-nowrap">
                  {activeHedgehog.gender === 'male'
                    ? '男の子'
                    : activeHedgehog.gender === 'female'
                      ? '女の子'
                      : '性別不明'}
                </span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-600">
                <Cake className="h-3 w-3" />
                <span className="whitespace-nowrap">
                  {activeHedgehog.birthDate
                    ? `${calculateAge(activeHedgehog.birthDate)}`
                    : '年齢不詳'}
                </span>
              </div>
            </div>

            {/* Row 3: Switcher (Right Bottom) */}
            <div className="flex justify-end">
              <HedgehogSwitcher hedgehogs={hedgehogs} activeId={activeHedgehog.id} />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href={`/records/${activeHedgehog.id}/entry`} className="block">
          <Button
            variant="outline"
            className="flex h-24 w-full flex-col gap-2 border-orange-100 bg-orange-50/50 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-100/50 hover:shadow-md"
          >
            <NotepadText className="h-8 w-8 text-[var(--color-primary)]" />
            <span className="font-bold text-stone-700">今日の記録</span>
          </Button>
        </Link>
        <Link href={`/hospital/entry`} className="block">
          <Button
            variant="outline"
            className="flex h-24 w-full flex-col gap-2 border-green-100 bg-green-50/50 shadow-sm transition-all hover:border-green-200 hover:bg-green-100/50 hover:shadow-md"
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
            <Bell className="h-5 w-5 fill-yellow-400 text-yellow-600" /> お世話リマインダー
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
          <Card className="flex items-center justify-between border-stone-100 bg-white p-4 shadow-sm transition-all hover:bg-orange-50/50 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                <Instagram className="h-6 w-6" />
              </div>
              <span className="font-bold text-stone-700">ハリネズミ協会<br />インスタグラム</span>
            </div>
            <ExternalLink className="h-4 w-4 text-stone-400" />
          </Card>
        </a>

        <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Card className="flex items-center justify-between border-stone-100 bg-white p-4 shadow-sm transition-all hover:bg-green-50/50 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Globe className="h-6 w-6" />
              </div>
              <span className="font-bold text-stone-700">ハリネズミ協会<br />WEBサイト</span>
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
