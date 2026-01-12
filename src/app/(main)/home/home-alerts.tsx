import { AlertTriangle } from 'lucide-react';

import { getHealthAlerts } from './actions';

export async function HomeAlerts({ hedgehogId }: { hedgehogId: string }) {
  const alerts = await getHealthAlerts(hedgehogId);

  // アラートがない場合は何も表示しない（ユーザー要望）
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            alert.level === 'warning'
              ? 'border-red-100 bg-red-50/80'
              : 'border-blue-100 bg-blue-50/80'
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              alert.level === 'warning' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3
              className={`font-bold ${
                alert.level === 'warning' ? 'text-red-800' : 'text-blue-800'
              }`}
            >
              {alert.level === 'warning' ? '健康アラート' : 'お知らせ'}
            </h3>
            <p
              className={`text-sm ${alert.level === 'warning' ? 'text-red-700' : 'text-blue-700'}`}
            >
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
