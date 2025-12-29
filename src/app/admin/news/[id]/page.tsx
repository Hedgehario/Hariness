import NewsForm from '../news-form';
import { getNews } from '../../actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = await getNews(id);

  if (!news) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/news">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            一覧に戻る
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-stone-800">お知らせ編集</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>お知らせを編集</CardTitle>
        </CardHeader>
        <NewsForm initialData={news} />
      </Card>
    </div>
  );
}
