import {
  Cake,
  Edit2,
  Globe,
  Hospital,
  Instagram,
  Mail,
  Mars,
  NotepadText,
  Venus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { logout } from '@/app/(auth)/actions';
import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getMyReminders, type ReminderDisplay } from '@/app/(main)/reminders/actions';
import { HedgehogSwitcher } from '@/components/hedgehogs/hedgehog-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { getActiveHedgehogIdFromServer } from '@/lib/hedgehog-cookie-server';

import { HomeAlerts } from './home-alerts';
import { HomeReminderItem } from './home-reminder-item';

const INSTAGRAM_URL = 'https://www.instagram.com/jha._p.hedgehog.jp/';
const WEB_URL = 'https://www.p-hedgehog.com/';
const MAIL_ADDRESS = 'phedgehogjp@gmail.com';

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
  const [hedgehogs, reminders, params, cookieHedgehogId] = await Promise.all([
    getMyHedgehogs(),
    getMyReminders(),
    searchParams,
    getActiveHedgehogIdFromServer(),
  ]);
  // URLパラメータ優先、なければCookie、それもなければ最初の子
  const hedgehogId = params.hedgehogId as string | undefined || cookieHedgehogId;

  // ハリネズミが登録されていない場合
  if (hedgehogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-4">
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
      <Card className="relative h-34 overflow-hidden border border-stone-100 bg-white">
        <div className="flex h-full items-center gap-4 p-4">
          {/* Avatar */}
          <div className="h-28 w-28 flex-shrink-0 rounded-full border border-stone-100 bg-white p-0.5">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-stone-100">
              <Image
                src={activeHedgehog.imageUrl || '/images/default-hedgehog.webp'}
                alt={activeHedgehog.name}
                fill
                className="object-cover"
                sizes="80px"
                priority
              />
            </div>
          </div>

          {/* 名前 + 編集ボタン */}
          <div className="flex items-center gap-1">
            <CardTitle className="text-xl font-bold text-stone-700">
              {activeHedgehog.name.length > 11
                ? `${activeHedgehog.name.slice(0, 11)}...`
                : activeHedgehog.name}
            </CardTitle>
            <Link href={`/hedgehogs/${activeHedgehog.id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-stone-300 hover:bg-stone-100 hover:text-[var(--color-primary)]"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 性別・年齢バッジ + 切替ボタン（右下固定） */}
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-stone-100 px-2 py-1 text-xs font-bold text-stone-600">
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              {activeHedgehog.gender === 'male' ? (
                <Mars className="h-3 w-3" strokeWidth={2.5} />
              ) : activeHedgehog.gender === 'female' ? (
                <Venus className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <span className="text-xs">?</span>
              )}
            </span>
            <span className="whitespace-nowrap">
              {activeHedgehog.gender === 'male'
                ? '男の子'
                : activeHedgehog.gender === 'female'
                  ? '女の子'
                  : '性別不明'}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
            <Cake className="h-3 w-3" />
            <span className="whitespace-nowrap">
              {activeHedgehog.birthDate
                ? `${calculateAge(activeHedgehog.birthDate)}`
                : '年齢不詳'}
            </span>
          </div>
          {/* 切替ボタン */}
          <HedgehogSwitcher hedgehogs={hedgehogs} activeId={activeHedgehog.id} />
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href={`/records/${activeHedgehog.id}/entry`} className="block">
          <Button
            variant="outline"
            className="flex h-16 w-full flex-col gap-1 rounded-xl border border-stone-100 bg-white transition-all hover:bg-stone-50"
          >
            <NotepadText className="h-6 w-6 text-[var(--color-primary)]" />
            <span className="font-bold text-stone-700">今日の記録</span>
          </Button>
        </Link>
        <Link href={`/hospital/entry`} className="block">
          <Button
            variant="outline"
            className="flex h-16 w-full flex-col gap-1 rounded-xl border border-stone-100 bg-white transition-all hover:bg-stone-50"
          >
            <Hospital className="h-6 w-6 text-[#4DB6AC]" />
            <span className="font-bold text-stone-700">通院記録</span>
          </Button>
        </Link>
      </div>

      {/* Alerts Section (New) */}
      <HomeAlerts hedgehogId={activeHedgehog.id} />

      {/* 共通タスク区切り */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400">共通タスク</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      {/* Reminders / ToDo - Wrapped in card like reference design */}
      <Card className="overflow-hidden border border-stone-100 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="font-bold text-stone-700">お世話リマインダー</h2>
          <Link href="/reminders">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-stone-400">
              編集・管理
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="divide-y divide-stone-100">
          {reminders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-gray-400">
              <p>今日のリマインダーはありません</p>
              <Link href="/reminders/entry">
                <Button size="sm" variant="outline" className="h-7 rounded-xl text-xs">
                  追加する
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {reminders.map((reminder: ReminderDisplay) => (
                <HomeReminderItem key={reminder.id} reminder={reminder} />
              ))}
              <div className="p-3 text-center">
                <Link href="/reminders/entry">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-stone-400 hover:text-[var(--color-primary)]"
                  >
                    + 新しいリマインダーを追加
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Footer Links - Simplified like reference design */}
      <div className="flex flex-col gap-3">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Card className="flex items-center gap-3 border border-stone-100 bg-white p-4 transition-colors hover:bg-stone-50">
            {/* Soft pink/coral background - different from theme orange */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50">
              <Instagram className="h-4 w-4 text-pink-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-600">
                日本ハリネズミ協会™ 公式Instagram
              </p>
              <p className="text-xs text-stone-400">毎日のお世話に役立つ情報を発信中</p>
            </div>
          </Card>
        </a>

        <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Card className="flex items-center gap-3 border border-stone-100 bg-white p-4 transition-colors hover:bg-stone-50">
            {/* Soft blue background - different from theme teal */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
              <Globe className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-600">日本ハリネズミ協会™ 公式サイト</p>
              <p className="text-xs text-stone-400">協会の活動やイベントをもっと詳しく</p>
            </div>
          </Card>
        </a>

        <div className="py-2 text-center">
          <p className="mb-1 text-xs text-stone-400">アプリに関するお問い合わせはこちら</p>
          <a
            href={`mailto:${MAIL_ADDRESS}`}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
          >
            <Mail className="h-3 w-3" />
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

  // 総月数を計算
  let totalMonths =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());

  // 日付がまだ来ていない場合は1ヶ月引く
  if (today.getDate() < birthDate.getDate()) {
    totalMonths--;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  // 0歳の場合は月齢のみ
  if (years === 0) {
    return `${months}ヶ月`;
  }

  // 1歳以上は「○歳○ヶ月」形式
  if (months === 0) {
    return `${years}歳`;
  }

  return `${years}歳${months}ヶ月`;
}
