'use client';

// Admin login. Uses real Supabase email/password authentication — there is no
// client-side or localStorage "fake" auth anywhere in this project.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { LogoMark } from '@/components/ui';
import { signIn } from '@/actions/admin';
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED_MESSAGE } from '@/lib/supabase/env';
import { ADMIN_USERNAME } from '@/lib/constants';

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const notConfigured = !isSupabaseConfigured();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn(username.trim(), password);
      if (res.success) {
        router.replace('/admin');
        router.refresh();
      } else {
        setError(res.error ?? 'Login failed.');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-teal-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to website
        </Link>

        <div className="card overflow-hidden">
          <div className="gradient-brand px-7 py-8 text-center text-white">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <LogoMark className="h-10 w-10" />
            </div>
            <h1 className="font-display text-2xl font-bold">Admin Sign In</h1>
            <p className="mt-1 text-sm text-white/85">Modern Diagnostic — secure back-office</p>
          </div>

          <div className="p-7">
            {notConfigured && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="flex gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">Setup required.</strong> {SUPABASE_NOT_CONFIGURED_MESSAGE}
                  </span>
                </p>
              </div>
            )}

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="label">Username</label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="field"
                  placeholder={ADMIN_USERNAME}
                  disabled={notConfigured}
                />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                  placeholder="••••••••"
                  disabled={notConfigured}
                />
              </div>

              <button
                type="submit"
                disabled={isPending || notConfigured}
                className="btn-primary w-full"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…</>
                ) : (
                  <><Lock className="h-4 w-4" aria-hidden="true" /> Sign in securely</>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
              Accounts are created by the laboratory owner. There is no public registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
