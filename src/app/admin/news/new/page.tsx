import NewsForm from '../news-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/news">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            一覧に戻る
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-stone-800">お知らせ作成</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新しいお知らせを作成</CardTitle>
        </CardHeader>
        <NewsForm />
      </Card>
    </div>
  );
}
