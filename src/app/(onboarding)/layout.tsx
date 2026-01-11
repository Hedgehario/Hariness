import Image from 'next/image';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8F8F0]">
      {/* Simple Header */}
      <header className="flex w-full items-center justify-center p-6">
        <h1 className="text-xl font-bold tracking-tight text-[#5D5D5D]">Hariness</h1>
      </header>

      {/* Content Area */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 pb-20">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </main>
    </div>
  );
}
