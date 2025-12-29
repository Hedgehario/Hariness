import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getNewsList, deleteNews } from "../actions";
import { Badge } from "@/components/ui/badge";

export default async function NewsListPage() {
  const newsList = await getNewsList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">お知らせ管理</h2>
        <Link href="/admin/news/new">
            <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
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
                <p className="text-stone-500 text-center py-8">お知らせはありません。</p>
            ) : (
                <div className="space-y-4">
                    {newsList.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-stone-800">{item.title}</h3>
                                    {item.is_published ? (
                                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">公開中</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-gray-400 text-white hover:bg-gray-500">下書き</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-stone-400">
                                    作成日: {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/admin/news/${item.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <form action={deleteNews.bind(null, item.id)}>
                                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
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
