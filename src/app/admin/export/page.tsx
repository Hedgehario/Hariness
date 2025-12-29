'use client';

import { FileDown, Loader2 } from 'lucide-react';
import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { exportData } from '../actions';

export default function ExportPage() {
  const [exportType, setExportType] = useState<string>('users');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportData(exportType as any, startDate, endDate);

      if (result.error) {
        alert(result.error);
        return;
      }

      if (result.csvContent && result.fileName) {
        // Client-side download trigger
        const blob = new Blob([result.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', result.fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      alert('エクスポート中にエラーが発生しました。');
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileDown className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-stone-800">データエクスポート</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV出力設定</CardTitle>
          <CardDescription>出力したいデータの種類と期間を選択してください。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>データ種別</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">ユーザー情報 (Users)</SelectItem>
                <SelectItem value="hedgehogs">個体情報 (Hedgehogs)</SelectItem>
                <SelectItem value="all_records">健康記録 (Weight Records Sample)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportType === 'all_records' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始日 (任意)</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>終了日 (任意)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleExport}
              className="w-full bg-blue-600 hover:bg-blue-700 md:w-auto"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  エクスポート中...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  CSVをダウンロード
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
