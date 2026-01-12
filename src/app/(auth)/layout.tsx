export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#F8F8F0] px-4 py-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
