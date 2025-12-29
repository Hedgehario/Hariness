export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">{children}</div>
    </div>
  );
}
