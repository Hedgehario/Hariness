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
            <CardTitle className="text-xl text-stone-700">プライバシーポリシー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed text-stone-600">
            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">1. 取得する情報</h2>
              <p>本サービスは、以下の情報を取得・利用します。</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <strong>ユーザー情報:</strong>{' '}
                  メールアドレス、パスワード、プロフィール情報
                </li>
                <li>
                  <strong>飼育記録データ:</strong>{' '}
                  ハリネズミの個体情報（名前、写真、生年月日等）、日々の記録（食事、排泄、通院記録等）
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">2. 利用目的</h2>
              <p>取得した情報は、以下の目的で利用します。</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>本サービスの提供、維持、不具合対応のため</li>
                <li>ユーザーへのお知らせ、アラート通知のため</li>
                <li>
                  日本ハリネズミ協会™による研究・統計分析、および飼育環境向上のための活動のため
                </li>
              </ul>
              <p className="mt-2 text-xs text-stone-500">
                ※研究目的で公表・共有する場合、特定の個人を識別できない形式（統計データまたは匿名加工情報）に処理します。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">
                3. 個人情報の管理と委託
              </h2>
              <p>
                当チームは、個人情報の漏洩、滅失を防ぐため、適切なセキュリティ対策を講じます。また、利用目的の達成に必要な範囲内で、個人情報の取り扱いの一部を外部（信頼できるクラウドサービス事業者等）に委託する場合があります。この場合、当チームは委託先を適切に監督します。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">4. 第三者への提供</h2>
              <p>
                当チームは、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>
                  公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合
                </li>
                <li>
                  本サービスの目的である、日本ハリネズミ協会™による研究・統計分析、およびハリネズミの飼育環境向上のために必要な場合
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">5. Cookieの使用</h2>
              <p>
                本サービスでは、お客様の利便性向上のためCookieを使用します。これにより、選択中のハリネズミ情報など、サービス利用に必要な設定を記憶します。Cookieは個人を特定する目的では使用しません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">
                6. 情報収集モジュールの利用
              </h2>
              <p>
                本サービスでは、機能改善および利用状況分析のため、第三者が提供する情報収集モジュールを利用する場合があります（例：Google
                Analytics, Firebase等）。これらは個人を特定しない形式で情報を収集します。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">
                7. 情報の開示・訂正・削除
              </h2>
              <p>
                ユーザーは、アプリ内の設定画面から登録情報を確認・修正・削除（退会）することができます。退会後は、適切な期間を経て個人情報をサーバーから削除します。ただし、研究目的ですでに統計処理・匿名化されたデータについては、削除の対象外となる場合があります。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">8. お問い合わせ</h2>
              <p>本ポリシーに関するお問い合わせは、以下の窓口までお願いいたします。</p>
              <div className="mt-3 rounded-lg bg-stone-50 p-3">
                <p className="font-medium text-stone-700">
                  日本ハリネズミ協会™ Hariness運営事務局
                </p>
                <a
                  href="mailto:phedgehogjp@gmail.com"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  phedgehogjp@gmail.com
                </a>
              </div>
            </section>

            <div className="mt-8 border-t border-stone-100 pt-4 text-center text-xs text-stone-400">
              2026年1月31日 制定
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
