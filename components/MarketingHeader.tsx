"use client";

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function MarketingHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  return (
    <div className="sticky top-0 z-50 mx-auto w-full max-w-6xl px-5 pt-4 md:px-8 md:pt-5">
      <header className="rounded-xl border border-[#d7dde6] bg-white/95 shadow-md backdrop-blur transition-colors duration-300 dark:border-[#5a5a5a] dark:bg-[#3a3a3a]/95">
        <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-5">
          <Link href="/" className="flex items-center gap-2.5 text-base font-bold md:text-lg">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-400 text-[11px] font-black text-slate-900">E</span>
            <span>EmbodiTrust</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-700 dark:text-slate-200 md:flex">
            <Link href="/verification-agents" className="hover:text-slate-900 dark:hover:text-white">Verification Agents</Link>
            <Link href="/industries" className="hover:text-slate-900 dark:hover:text-white">Industries</Link>
            <Link href="/use-cases" className="hover:text-slate-900 dark:hover:text-white">Use Cases</Link>
            <Link href="/resources" className="hover:text-slate-900 dark:hover:text-white">Resources</Link>
            <Link href="/company" className="hover:text-slate-900 dark:hover:text-white">Company</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-[#666666] dark:bg-[#444444] dark:text-slate-100 dark:hover:bg-[#505050]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <Link href="/#contact" className="rounded-md bg-[#042333] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a]">Book a Demo</Link>
          </div>
        </div>
      </header>
    </div>
  );
}
