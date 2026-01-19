export default function Loading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-[var(--color-primary)]" />
        <p className="text-sm text-stone-400">読み込み中...</p>
      </div>
    </div>
  );
}
