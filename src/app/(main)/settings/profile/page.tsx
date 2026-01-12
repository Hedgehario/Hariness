import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getProfile } from '@/app/(auth)/actions';

import { ProfileForm } from './profile-form';

export default async function ProfileSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      {/* L2 Back Navigation */}
      <div className="flex items-center px-4 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-1 rounded-full p-2 text-[#5D5D5D] hover:bg-stone-100"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-bold">戻る</span>
        </Link>
      </div>

      <div className="mx-auto max-w-lg p-6">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
