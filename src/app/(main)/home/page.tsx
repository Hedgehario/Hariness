import Link from "next/link";
import { getMyHedgehogs } from "@/app/(main)/hedgehogs/actions";
import { getMyReminders } from "@/app/(main)/reminders/actions";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeReminderItem } from "./home-reminder-item";

export default async function HomePage() {
  const hedgehogs = await getMyHedgehogs();
  const reminders = await getMyReminders();
  
  // 個体が登録されていない場合
  if (hedgehogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
        <div className="text-4xl">🦔</div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">ようこそ Harinessへ</h1>
        <p className="text-gray-600 text-center">
          まずはあなたのハリネズミちゃんを登録しましょう！
        </p>
        <Link href="/hedgehogs/new">
          <Button size="lg" className="rounded-full px-8 shadow-lg">
            個体を登録する
          </Button>
        </Link>
        <form action={logout}>
           <Button variant="ghost" className="text-sm text-gray-400">ログアウト</Button>
        </form>
      </div>
    );
  }

  // メインの個体（とりあえず最初の1匹）
  const activeHedgehog = hedgehogs[0];

  return (
    <div className="p-4 space-y-6">
      {/* Hedgehog Card */}
      <Card className="border-none shadow-md overflow-hidden bg-white">
          <div className="h-32 bg-[var(--color-primary)]/20 relative">
             {/* 背景装飾（後で画像にする） */}
             <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                🌿
             </div>
          </div>
          <CardHeader className="relative pt-0 pb-2">
            <div className="absolute -top-12 left-6">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                    <div className="w-full h-full rounded-full bg-stone-200 flex items-center justify-center text-4xl overflow-hidden">
                        {/* 画像があれば表示、なければ絵文字 */}
                        🦔
                    </div>
                </div>
            </div>
            <div className="ml-32 mt-2">
                <CardTitle className="text-2xl font-bold mb-1">{activeHedgehog.name}</CardTitle>
                <div className="flex gap-2 text-sm text-gray-500">
                    <span>{activeHedgehog.gender === 'male' ? '♂ 男の子' : activeHedgehog.gender === 'female' ? '♀ 女の子' : '性別不明'}</span>
                    <span>•</span>
                    <span>{activeHedgehog.birth_date ? `${calculateAge(activeHedgehog.birth_date)}` : '年齢不詳'}</span>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-gray-600 line-clamp-2">
                {activeHedgehog.features || "特徴はまだ登録されていません。"}
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
            <Link href={`/records/${activeHedgehog.id}/entry`} className="block">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-orange-50/50 border-orange-100 hover:bg-orange-100/50 hover:border-orange-200">
                    <span className="text-3xl">📝</span>
                    <span className="font-bold text-stone-700">今日の記録</span>
                </Button>
            </Link>
            <Link href={`/hospital/entry`} className="block">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-green-50/50 border-green-100 hover:bg-green-100/50 hover:border-green-200">
                    <span className="text-3xl">🏥</span>
                    <span className="font-bold text-stone-700">通院メモ</span>
                </Button>
            </Link>
        </div>

        {/* Reminders / ToDo */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-stone-700 flex items-center gap-2">
                    <span>🔔</span> やることリスト
                </h2>
                <Link href="/reminders">
                    <Button variant="ghost" size="sm" className="text-xs text-[var(--color-primary)] h-8">
                        編集・一覧
                    </Button>
                </Link>
            </div>

            {reminders.length === 0 ? (
                <div className="bg-white/50 p-6 rounded-xl text-center text-gray-500 text-sm border border-stone-100 flex flex-col items-center gap-2">
                    <p>今日のリマインダーはありません</p>
                    <Link href="/reminders/entry">
                        <Button size="sm" variant="outline" className="rounded-full text-xs h-8">
                            追加する
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {reminders.map((reminder: any) => (
                        <HomeReminderItem key={reminder.id} reminder={reminder} />
                    ))}
                    <div className="text-center pt-2">
                         <Link href="/reminders/entry">
                            <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-[var(--color-primary)]">
                                + 新しいリマインダーを追加
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

// 年齢計算ヘルパー (簡易)
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
        let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
         if (today.getDate() < birthDate.getDate()) months--;
        return `${months}ヶ月`;
    }
    
    return `${age}歳`;
}
