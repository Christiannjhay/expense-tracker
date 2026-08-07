// app/(auth)/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google';


const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta', 
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-black px-4`}>
      <div className="w-full max-w-md rounded-2xl bg-[#212121] p-8 shadow-md">
        {children}
      </div>
    </div>
  );
}