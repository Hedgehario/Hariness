import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F0] p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-800">利用規約</h1>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              戻る
            </Button>
          </Link>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-stone-700">Hariness 利用規約</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-stone-600 leading-relaxed">
            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">1. はじめに</h2>
              <p>
                この利用規約（以下「本規約」）は、Hariness開発チーム（以下「当チーム」）が提供するハリネズミ健康管理アプリ「Hariness」（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">2. 本サービスの目的</h2>
              <p>
                本サービスは、飼い主様がハリネズミの健康記録を管理し、適切な飼育をサポートすることを目的としています。また、蓄積されたデータは匿名化処理を行った上で、日本ハリネズミ協会™による研究・統計分析に活用され、ハリネズミ全体の飼育環境向上に役立てられます。
              </p>
            </section>

            <section className="rounded-lg bg-orange-50 p-4 border border-orange-100">
              <h2 className="mb-2 text-base font-bold text-orange-800">3. 免責事項（重要）</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  本サービスが提供するアラート機能や健康アドバイスは、あくまで記録データに基づいた簡易的な目安であり、<strong>獣医師による医療診断を代替するものではありません。</strong>
                </li>
                <li>
                  本サービスの結果に関わらず、ハリネズミの体調に不安がある場合は、速やかに獣医師の診断を受けてください。
                </li>
                <li>
                  当チームは、本サービスの利用により生じた損害（ハリネズミの健康被害を含む）について、一切の責任を負いません。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">4. アカウント管理</h2>
              <p>
                ユーザーは、自身の責任でメールアドレスおよびパスワードを管理するものとします。盗用や第三者による不正利用について、当チームは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">5. 禁止事項</h2>
              <p>
                法令違反行為、公序良俗に反する行為、本サービスの運営を妨害する行為、虚偽のデータを意図的に登録する行為などを禁止します。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">6. サービスの変更・終了</h2>
              <p>
                当チームは、ユーザーへの事前の通知なく、本サービスの内容を変更または提供を終了することができるものとします。
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
