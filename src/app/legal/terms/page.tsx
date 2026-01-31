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
          <CardContent className="space-y-6 text-sm leading-relaxed text-stone-600">
            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">1. はじめに</h2>
              <p>
                この利用規約（以下「本規約」）は、Hariness開発チーム（以下「当チーム」）が提供するハリネズミ健康管理アプリ「Hariness」（以下「本サービス」）の利用条件を定めるものです。ユーザーは、本サービスの利用をもって本規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">
                2. 本サービスの目的とデータの利用
              </h2>
              <p className="mb-2">
                本サービスは、ハリネズミの健康管理および日本ハリネズミ協会™による研究支援を目的としています。
              </p>
              <p>
                ユーザーは、当チームおよび日本ハリネズミ協会™が、本サービスに登録されたデータ（数値、記録、画像等）を、個人を特定できない統計的または匿名化された状態で、研究・分析・統計データの作成・出版等のために、無償かつ無制限に利用することを許諾するものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">3. 知的財産権</h2>
              <p className="mb-2">
                本サービスを構成するプログラム、デザイン、商標等の権利は当チームに帰属します。
              </p>
              <p>
                ユーザーが投稿したデータの著作権はユーザーに留保されますが、前項の定めに従い、当チームはこれを利用できるものとします。
              </p>
            </section>

            <section className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <h2 className="mb-2 text-base font-bold text-orange-800">4. 免責事項（重要）</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  本サービスのアラートや助言は、記録に基づく目安であり、
                  <strong>獣医師の診断を代替するものではありません。</strong>
                  本サービスの結果に関わらず、ハリネズミの体調に不安がある場合は、速やかに獣医師の診断を受けてください。
                </li>
                <li>
                  当チームは、本サービスの利用、中断、終了により生じたあらゆる損害（データの消失、生体の健康被害を含む）について、一切の責任を負いません。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">5. アカウント管理</h2>
              <p>
                メールアドレスおよびパスワードの管理はユーザーの自己責任とし、第三者の不正利用について当チームは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">6. 禁止事項</h2>
              <p>
                法令違反、公序良俗に反する行為、虚偽データの登録、本サービスの運営妨害、他ユーザーへの迷惑行為を禁止します。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">7. 利用停止・登録抹消</h2>
              <p>
                当チームは、ユーザーが本規約に違反した場合、または不適切と判断した場合、事前の通知なく当該ユーザーの利用を停止、または登録を抹消することができるものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">8. 反社会的勢力の排除</h2>
              <p>
                ユーザーは、自身が反社会的勢力（暴力団、暴力団員等）でないこと、およびこれらと関係を持たないことを表明し、保証するものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">9. サービスの変更・終了</h2>
              <p>
                当チームは、事前の通知なく本サービスの内容変更または提供終了を行うことができます。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-800">10. 準拠法・裁判管轄</h2>
              <p>
                本規約は日本法に準拠します。本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
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
