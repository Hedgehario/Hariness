import { ExternalLink,MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Google My MapのID (共有リンクの ?mid= の後ろの部分)
// 例: 日本ハリネズミ協会様のマップなど、適切なIDに差し替えてください
const GOOGLE_MYMAP_ID = '1_PLACEHOLDER_MID_PLEASE_REPLACE_ME';
const SUGGESTION_FORM_URL = 'https://forms.google.com/your-form-id'; // 病院情報提供フォームのURL

export default function MapPage() {
  return (
    <div className="flex h-full flex-col bg-stone-50 pb-20">
      {/* Header */}
      <div className="safe-area-top sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <h1 className="flex items-center gap-2 text-lg font-bold text-stone-700">
          <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
          病院マップ
        </h1>
      </div>

      {/* Map Container */}
      <div className="relative h-full min-h-[500px] w-full flex-1 bg-stone-200">
        {GOOGLE_MYMAP_ID.includes('PLACEHOLDER') ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-stone-500">
            <MapPin className="mb-4 h-12 w-12 text-stone-300" />
            <h3 className="mb-2 text-lg font-bold">マップIDが未設定です</h3>
            <p className="mb-4 text-sm">
              <code>src/app/(main)/map/page.tsx</code> の<br />
              <code>GOOGLE_MYMAP_ID</code> を<br />
              有効なGoogleマイマップIDに書き換えてください。
            </p>
            <p className="text-xs text-stone-400">
              ※日本ハリネズミ協会様のマップなどを埋め込むことが可能です。
            </p>
          </div>
        ) : (
          <iframe
            src={`https://www.google.com/maps/d/embed?mid=${GOOGLE_MYMAP_ID}&ehbc=2E312F`}
            width="100%"
            height="100%"
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      {/* Footer Info / Action */}
      <div className="border-t border-stone-200 bg-white p-4">
        <Card className="mb-4 border-orange-100 bg-orange-50 p-4">
          <h3 className="mb-1 text-sm font-bold text-stone-700">💡 ご利用の注意</h3>
          <p className="text-xs leading-relaxed text-stone-600">
            掲載されている情報は最新ではない場合があります。
            <br />
            受診の際は必ず電話で「ハリネズミの診察が可能か」をご確認ください。
          </p>
        </Card>

        <a href={SUGGESTION_FORM_URL} target="_blank" rel="noopener noreferrer">
          <Button className="w-full border border-stone-200 bg-white text-stone-600 shadow-sm hover:bg-stone-50">
            <ExternalLink className="mr-2 h-4 w-4" />
            新しい病院情報を提案する
          </Button>
        </a>
      </div>
    </div>
  );
}
