'use client';

import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleJoinWaitlist = () => {
    // Redirect directly to Google Form
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSd3Rx0VAHmR8jNddlyjhSVQtosZnURwM2P2gnQDu1puYXH1KQ/viewform';
  };

  const navItems = [
    { href: '#about', label: 'About Emboditrust' },
    { href: '#features', label: 'Features' },
    { href: '#products', label: 'Products' },
    { href: '#industries', label: 'Industries' },
    { href: '#contact', label: 'Join Waitlist' },
  ];

  return (
    <header className="bg-white font-headerAlt shadow-sm fixed w-full top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-blue-600 rounded-lg"></div> */}
            <span className="text-xl font-bold text-gray-800">EmbodiTrust</span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.slice(0, -1).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-emerald-500 transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={handleJoinWaitlist}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-500 transition-colors duration-300"
            >
              Join Waitlist
            </button>
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
          <div className="md:hidden mt-4 space-y-4">
            {navItems.map((item) => (
              item.href === '#contact' ? (
                <button
                  key={item.href}
                  onClick={handleJoinWaitlist}
                  className="block w-full text-left text-gray-600 hover:text-blue-800 transition-colors duration-300"
                >
                  {item.label}
                </button>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="block text-gray-600 hover:text-blue-600 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              )
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}