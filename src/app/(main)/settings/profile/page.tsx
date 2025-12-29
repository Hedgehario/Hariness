import { getProfile, updateProfile } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function ProfileSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center gap-3 safe-area-top">
        <Link href="/settings">
             <Button variant="ghost" size="icon" className="-ml-2">
                 <ArrowLeft className="w-5 h-5 text-stone-600" />
             </Button>
        </Link>
        <h1 className="font-bold text-lg text-stone-700">プロフィール設定</h1>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
