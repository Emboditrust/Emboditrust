 'use client';

import Link from "next/link";

export default function Hero() {
  const handleJoinWaitlist = () => {
    // Redirect directly to Google Form
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSd3Rx0VAHmR8jNddlyjhSVQtosZnURwM2P2gnQDu1puYXH1KQ/viewform';
  };

  return (
    <section className="bg-white text-gray-800 pt-24 pb-20 border-b border-gray-100">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Secure Every Product.<br />
          <span className="text-emerald-600">Empower Every Customer.</span>
        </h1>
        
        <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-3xl mx-auto font-semibold">
          Protecting Brands from Counterfeits. Building Trust with Every Scan.
        </p>

        <p className="text-base mb-12 font-headerAlt text-gray-500 max-w-4xl mx-auto leading-relaxed">
          EmbodiTrust is a mobile and blockchain-enabled product authentication platform 
          that helps brands stop counterfeits and fraud, build consumer trust, and strengthen 
          loyalty through secure QR technology and real-time engagement.
        </p>

        <div className="flex w-full flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="#contact"
            className="bg-emerald-400 w-full md:w-1/5 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-500 transition-colors duration-300 shadow-lg"
          >
            Contact
          </Link>
          <a
            href="#features"
            className="border-2 w-full md:w-1/5 border-emerald-500 text-emerald-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-400 hover:border-transparent hover:text-white transition-colors duration-300"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}