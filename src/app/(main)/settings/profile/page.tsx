import { getProfile, updateProfile } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';

export default async function ProfileSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24">
      {/* Header */}
      <div className="safe-area-top sticky top-0 z-10 flex items-center gap-3 border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="h-5 w-5 text-stone-600" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-stone-700">プロフィール設定</h1>
      </div>

      <div className="mx-auto max-w-lg p-6">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
