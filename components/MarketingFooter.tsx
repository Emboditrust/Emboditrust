import Link from 'next/link';
import Image from 'next/image';

export default function MarketingFooter() {
  return (
    <footer className="bg-[#032434] text-white transition-colors duration-300 dark:bg-[#2f2f2f]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 md:grid-cols-[1fr_auto] md:px-8">
        <div>
          <div className="flex items-center gap-2 text-2xl font-black">
            <Image src="/logo.png" alt="EmbodiTrust" width={28} height={28} className="h-7 w-7 rounded-full" />
            EmbodiTrust
          </div>
          <p className="mt-2 text-sm text-slate-200">Verification intelligence for safer products and stronger trust.</p>
        </div>

        <div className="flex flex-wrap items-end gap-4 text-sm text-slate-200">
          <Link href="/#contact" className="hover:text-white">Contact</Link>
          <Link href="#" className="hover:text-white">Privacy</Link>
          <Link href="#" className="hover:text-white">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
