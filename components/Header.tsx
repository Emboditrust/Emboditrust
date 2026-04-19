'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const navItems = [
    { href: '#features', label: 'Verification' },
    { href: '#products', label: 'Templates' },
    { href: '#industries', label: 'Industries' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <nav className="container mx-auto px-4 py-4 md:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-emerald-600" />
            <span className="text-lg font-semibold text-slate-900">EmbodiTrust</span>
          </div>
          
          <div className="hidden md:flex space-x-7 items-center">
            {navItems.slice(0, 3).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-slate-600 transition-colors duration-300 hover:text-emerald-600"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/admin-login"
              className="text-sm font-medium text-emerald-600"
            >
              Sign in
            </Link>
            <Link
              href="#contact"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-emerald-500"
            >
              Create my protection flow
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="mt-4 space-y-4 md:hidden">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-slate-600 transition-colors duration-300 hover:text-emerald-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link href="/admin-login" className="block text-slate-600">Sign in</Link>
            <Link href="#contact" className="block rounded-full bg-emerald-600 px-4 py-2 text-center font-semibold text-white">
              Create my protection flow
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

