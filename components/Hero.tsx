 'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-slate-950 to-slate-900 text-white pt-32 pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full text-sm font-medium text-emerald-300">
            Product Authentication Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Secure Every Product.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Build Consumer Trust.</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-slate-300 font-light">
            Real-time verification and anti-counterfeit intelligence at scale
          </p>

          <p className="text-base md:text-lg mb-10 text-slate-400 max-w-2xl mx-auto leading-relaxed">
            EmbodiTrust is an all-in-one platform for product authentication, fraud detection, and consumer engagement. Monitor every scan, detect threats in real-time, and connect with verified customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#contact"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Learn More <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}