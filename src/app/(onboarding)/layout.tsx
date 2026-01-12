export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#F8F8F0]">
      {/* Simple Header */}
      <header className="flex w-full items-center justify-center py-4">
        <h1 className="text-xl font-bold tracking-tight text-[#5D5D5D]">Hariness</h1>
      </header>

      {/* Content Area */}
      <main className="flex flex-1 flex-col items-center p-4 pt-4 sm:justify-center">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </main>
    </div>
  );
}
