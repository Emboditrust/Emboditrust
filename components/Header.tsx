'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#products', label: 'Products' },
    { href: '#industries', label: 'Solutions' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <nav className="container mx-auto px-4 py-4 md:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <span className="text-lg font-bold text-white">EmbodiTrust</span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-lg font-bold text-slate-300 transition-colors duration-300 hover:text-emerald-400"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/admin-login"
              className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="#contact"
              className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mt-4 space-y-4 pb-4 md:hidden border-t border-slate-800 pt-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-slate-300 hover:text-emerald-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/admin-login" className="text-slate-300 text-sm">Sign in</Link>
              <Link href="#contact" className="block bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-center rounded-lg font-semibold text-white text-sm">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

