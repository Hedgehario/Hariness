import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, ExternalLink } from "lucide-react";

// Google My MapのID (共有リンクの ?mid= の後ろの部分)
// 例: 日本ハリネズミ協会様のマップなど、適切なIDに差し替えてください
const GOOGLE_MYMAP_ID = "1_PLACEHOLDER_MID_PLEASE_REPLACE_ME"; 
const SUGGESTION_FORM_URL = "https://forms.google.com/your-form-id"; // 病院情報提供フォームのURL

export default function MapPage() {
  return (
    <div className="flex flex-col h-full bg-stone-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between safe-area-top">
        <h1 className="font-bold text-lg text-stone-700 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
          病院マップ
        </h1>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full h-full min-h-[500px] relative bg-stone-200">
        {GOOGLE_MYMAP_ID.includes("PLACEHOLDER") ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-stone-500">
              <MapPin className="w-12 h-12 mb-4 text-stone-300" />
              <h3 className="font-bold text-lg mb-2">マップIDが未設定です</h3>
              <p className="text-sm mb-4">
                <code>src/app/(main)/map/page.tsx</code> の<br/>
                <code>GOOGLE_MYMAP_ID</code> を<br/>
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
            className="border-0 w-full h-full absolute inset-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      {/* Footer Info / Action */}
      <div className="p-4 bg-white border-t border-stone-200">
         <Card className="p-4 bg-orange-50 border-orange-100 mb-4">
            <h3 className="font-bold text-sm text-stone-700 mb-1">💡 ご利用の注意</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
                掲載されている情報は最新ではない場合があります。<br/>
                受診の際は必ず電話で「ハリネズミの診察が可能か」をご確認ください。
            </p>
         </Card>

         <a href={SUGGESTION_FORM_URL} target="_blank" rel="noopener noreferrer">
            <Button className="w-full text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 shadow-sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                新しい病院情報を提案する
            </Button>
         </a>
      </div>
    </div>
  );
}
