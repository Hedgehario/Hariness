import { Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { deleteNews, getNewsList } from '../actions';

export default async function NewsListPage() {
  const newsList = await getNewsList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">お知らせ管理</h2>
        <Link href="/admin/news/new">
          <Button className="gap-1 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" />
            新規作成
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>登録済みのお知らせ</CardTitle>
        </CardHeader>
        <CardContent>
          {newsList.length === 0 ? (
            <p className="py-8 text-center text-stone-500">お知らせはありません。</p>
          ) : (
            <div className="space-y-4">
              {newsList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4"
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-bold text-stone-800">{item.title}</h3>
                      {item.is_published ? (
                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                          公開中
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-400 text-white hover:bg-gray-500"
                        >
                          下書き
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">
                      作成日: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/news/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <form action={deleteNews.bind(null, item.id) as any}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
