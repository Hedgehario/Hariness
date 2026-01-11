import { ExternalLink, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Google My MapのID
const GOOGLE_MYMAP_ID = '1MLLHsPm_Sq2k_kG1dcdykRDR3w7sS5uJ';
// 病院情報提供フォームのURL（現在は未設定）
const SUGGESTION_FORM_URL = 'https://forms.google.com/placeholder-form';

export default function MapPage() {
  return (
    <div className="flex h-full flex-col bg-stone-50 pb-20">
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
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FFB370]" />
            <div>
              <h3 className="mb-1 text-sm font-bold text-stone-700">受診前にご確認ください</h3>
              <p className="text-xs leading-relaxed text-stone-600">
                掲載情報は最新ではない場合があります。
                <br />
                電話やWEBサイトで診察可否を確認すると安心です。
              </p>
            </div>
          </div>
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
