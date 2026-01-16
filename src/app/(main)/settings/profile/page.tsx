import { redirect } from 'next/navigation';

import { getProfile } from '@/app/(auth)/actions';

import { ProfileForm } from './profile-form';
import { SettingsBackButton } from '@/components/ui/settings-back-button';

export default async function ProfileSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      {/* L2 Back Navigation */}
      <div className="flex items-center px-4 py-3">
        <SettingsBackButton fallbackUrl="/settings" />
      </div>

      <div className="mx-auto max-w-lg p-6">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
