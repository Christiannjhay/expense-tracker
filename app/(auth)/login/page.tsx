'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 font-jakarta">
      <h2 className="text-center text-3xl font-bold tracking-tight text-white">
        Welcome Back
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <Field>
          <FieldLabel className="text-white">Email</FieldLabel>
          <Input
            className="rounded-3xl p-6 text-white"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-white">Password</FieldLabel>
          <Input
            className="rounded-3xl p-6 text-white"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          className="w-full h-12.5 rounded-3xl font-bold bg-white text-black"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50">
        Don’t have an account?{' '}
        <Link href="/register" className="font-semibold text-white hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}