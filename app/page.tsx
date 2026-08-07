// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <h1 className="text-3xl font-bold">
        Hi, this is Christian’s Budget Tracker 💸
      </h1>

      <p className="mt-3 text-white/60">
        Track your expenses, stay on budget, and take control of your money.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/register"
          className="rounded-3xl bg-white px-6 py-3 font-semibold text-black"
        >
          Get Started
        </Link>

        <Link
          href="/login"
          className="rounded-3xl border border-white px-6 py-3 font-semibold text-white"
        >
          Login
        </Link>
      </div>
    </div>
  );
}