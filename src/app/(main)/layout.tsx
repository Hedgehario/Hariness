import { AppHeader } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <AppHeader />
      
      {/* Header height approx 64px, BottomNav height approx 64px + safe area */}
      {/* pb-24 handles bottom nav space */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
