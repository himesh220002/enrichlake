'use client';

import Link from 'next/link';
import { AlertTriangle, Home, LayoutDashboard, RefreshCw } from 'lucide-react';

/**
 * Global 500 handler. Deliberately self-contained (no site-chrome imports)
 * so it can always render, even if a shared component fails.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#0b1b3f] antialiased">
        <main>
          <section className="bg-gradient-to-b from-[#eef3ff] via-[#f6f9ff] to-white">
            <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-24 sm:pt-28">
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#d5e1fb] bg-[#eef3ff] px-4 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-[#1740c2]">
                <AlertTriangle className="h-3.5 w-3.5" /> 500 · Engine hiccup
              </p>
              <h1 className="mx-auto mt-4 max-w-2xl text-balance text-5xl font-extrabold leading-none tracking-[-0.04em] sm:text-6xl">
                Something failed to load.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#55617c]">
                The research engine hit an unexpected error. Try again — your saved dossiers and
                inputs are kept locally and are safe.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f5bff] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1749d6]"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d5e1fb] bg-white px-6 py-3.5 text-sm font-bold text-[#0b1b3f] transition hover:border-[#1f5bff]/50 hover:text-[#1f5bff]"
                >
                  <Home className="h-4 w-4" /> Back to home
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d5e1fb] bg-white px-6 py-3.5 text-sm font-bold text-[#0b1b3f] transition hover:border-[#1f5bff]/50 hover:text-[#1f5bff]"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
