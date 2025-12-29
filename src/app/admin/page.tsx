import { FileDown, Newspaper } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">管理者ダッシュボード</h2>
        <p className="text-stone-500">日本ハリネズミ協会 ™ 管理システムの概要です。</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link href="/admin/export">
          <Card className="h-full cursor-pointer border-l-4 border-l-blue-500 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileDown className="h-6 w-6" />
                データエクスポート
              </CardTitle>
              <CardDescription>
                研究・分析用にアプリ内のデータをCSV形式で出力します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-stone-500">
                <ul className="list-disc space-y-1 pl-5">
                  <li>ユーザー情報</li>
                  <li>個体情報</li>
                  <li>健康記録データ</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/news">
          <Card className="h-full cursor-pointer border-l-4 border-l-green-500 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Newspaper className="h-6 w-6" />
                お知らせ管理
              </CardTitle>
              <CardDescription>
                アプリユーザーへのお知らせや重要なお知らせを配信・管理します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-stone-500">
                <ul className="list-disc space-y-1 pl-5">
                  <li>お知らせの新規作成</li>
                  <li>公開/非公開の設定</li>
                  <li>過去のお知らせの編集</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
