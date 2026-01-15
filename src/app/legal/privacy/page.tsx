import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F0] p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-800">プライバシーポリシー</h1>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              戻る
            </Button>
          </Link>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-stone-700">個人情報保護方針</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-stone-600 leading-relaxed">
            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">1. お客様から取得する情報</h2>
              <p>本サービスは、以下の情報を取得します。</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>アカウント情報（メールアドレス、パスワード、プロフィール情報）</li>
                <li>ハリネズミの個体情報（名前、写真、生年月日、体重など）</li>
                <li>日々の飼育記録（食事、排泄、投薬、通院記録など）</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">2. 利用目的</h2>
              <p>取得した情報は、以下の目的で利用します。</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>本サービスの提供、維持、改善のため</li>
                <li>ユーザーへのお知らせ、アラート通知のため</li>
                <li>
                  <strong>日本ハリネズミ協会™による研究・統計分析のため</strong>
                  <br />
                  <span className="text-xs text-stone-500">
                    ※研究目的でデータを使用する場合、個人を特定できない形式（匿名加工情報）に処理した上で利用します。
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">3. データの保存と管理</h2>
              <p>
                お客様のデータは、クラウドデータベース（Supabase）に安全に保管されます。通信は暗号化（SSL/TLS）され、厳重なセキュリティ基準のもと管理されます。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">4. 第三者提供</h2>
              <p>
                法令に基づく場合を除き、お客様の同意なく第三者に個人情報を提供することはありません。ただし、前述の日本ハリネズミ協会™による研究利用目的での匿名データの共有はこの限りではありません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">5. 情報の開示・訂正・削除</h2>
              <p>
                ユーザーは、アプリ内の設定画面からいつでもご自身の登録情報を確認・修正・削除（退会）することができます。退会処理を行った場合、登録された個人情報は所定の期間を経て完全に削除されます。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">6. お問い合わせ</h2>
              <p>
                本ポリシーに関するお問い合わせは、日本ハリネズミ協会™ お問い合わせ窓口までお願いいたします。
              </p>
            </section>

            <div className="mt-8 pt-4 border-t border-stone-100 text-xs text-stone-400 text-center">
              2025年9月4日 制定
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
