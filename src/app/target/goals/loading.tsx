export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 animate-pulse px-4 py-10">
      <div className="h-4 w-14 rounded-md bg-zinc-200 dark:bg-zinc-800" />

      <div className="mt-4 flex items-center justify-between">
        <div className="h-8 w-32 rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="mt-6 h-40 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
    </main>
  );
}
