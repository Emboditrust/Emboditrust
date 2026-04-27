'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ContactForm from '@/components/ContactForm';
import {
  ArrowRight,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  UsersRound,
  Building2,
  CircleHelp,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { TbBrandLivewire } from 'react-icons/tb';

const featureRows = [
  {
    title: 'Your Verification Intelligence Agent',
    description:
      'EmbodiTrust works as an autonomous verification agent: it watches product scans, flags suspicious behavior patterns, and tracks trust signals across your regions on autopilot.',
    reverse: false,
  },
  {
    title: 'Auto-Generated Risk Topics and Queries',
    description:
      'No manual setup. EmbodiTrust generates counterfeit risk topics from your brand and product context, then continuously evaluates scan behavior and anomaly paths.',
    reverse: true,
  },
  {
    title: 'Real-World Output and Evidence',
    description:
      'Capture every verification outcome, suspicious attempt, and hotspot signal. See exactly where interventions are needed and which channels are leaking trust.',
    reverse: false,
  },
  {
    title: 'Measure, Compare, Then Grow',
    description:
      'Every verification flow powers analytics. Track Authenticity Health, Suspicious Share, trust trend movement, and campaign outcomes from one dashboard.',
    reverse: true,
  },
];

const agentCards = [
  {
    title: 'Case Builder',
    description:
      'Turns suspicious scan signals into ready-to-action investigation cases for your operations and compliance team.',
  },
  {
    title: 'UGC Agent',
    description:
      'Finds brand-relevant community conversations and suggests trust-safe responses that improve brand confidence.',
  },
  {
    title: 'Content Optimizer',
    description:
      'Improves post-scan education and authenticity content so buyers get clearer verification guidance.',
  },
];

const industries = [
  { name: 'Travel', kind: 'travel' as const },
  { name: 'Ecommerce', kind: 'commerce' as const },
  { name: 'Finance', kind: 'finance' as const },
  { name: 'Healthcare', kind: 'health' as const },
  { name: 'Automotive', kind: 'auto' as const },
  { name: 'Education', kind: 'education' as const },
  { name: 'Real Estate', kind: 'real-estate' as const },
  { name: 'Legal', kind: 'legal' as const },
  { name: 'SaaS', kind: 'saas' as const },
  { name: 'Crypto', kind: 'crypto' as const },
];

const faqsLeft = [
  {
    question: 'What is EmbodiTrust?',
    answer: 'EmbodiTrust is a verification intelligence platform that helps brands and manufacturers prevent counterfeiting and ensure product authenticity. It uses QR and scratch codes with real-time verification capabilities, combined with AI-powered fraud detection, to track every product scan and identify suspicious patterns. The system works by storing hashed codes, performing instant verification via a fast, server-side API call, and flagging anomalies like geolocation mismatches or brute-force attempts.'
  },
  {
    question: 'Who is EmbodiTrust for?',
    answer: `EmbodiTrust is designed for brands and manufacturers serious about supply chain authenticity and loss prevention. It's ideal for companies subject to NAFDAC or other regulatory compliance requirements, enterprises experiencing significant counterfeiting losses, distributors needing real-time visibility into product flows, and teams that need to identify and investigate suspicious verification patterns. Any brand with a physical product can benefit from EmbodiTrust's intelligence engine.`
  },
  {
    question: 'What is the Verification Intelligence Engine?',
    answer: `The Verification Intelligence Engine is EmbodiTrust's autonomous monitoring system. It works by: (1) Accepting fast, server-side API calls when products are scanned; (2) Instantly checking code status(active, used, suspected_fake, or invalid); (3) Logging every verification attempt with metadata (IP, geolocation, user agent); (4) Detecting suspicious patterns like failed attempt spikes, geolocation mismatches, and duplicate "already used" scans; (5) Generating automated alerts for your admin team to investigate. The engine runs continuously without manual intervention.`
  },
  {
    question: 'How is EmbodiTrust different from basic QR validators?',
    answer: `Most QR validators only check if a code exists and is valid. EmbodiTrust goes beyond: it detects counterfeit patterns in real-time (geolocation mismatches, brute-force attempts, suspicious IP patterns), stores hashed codes, so even a database breach doesn't expose raw codes, implements rate limiting (100 req/min globally, 5 failed attempts/min per IP) to prevent attacks, and provides a complete audit trail in the verification_attempts collection. Your team gets a dashboard showing KPIs, heatmaps, and suspicious activity alerts for investigation.`
  },
  {
    question: `What is EmbodiTrust's roadmap and long-term vision?`,
    answer: `EmbodiTrust is building a full verification agent ecosystem. Currently live is the Verification Intelligence Engine (core verification and fraud detection). Coming in 2026: (1) Case Builder – automatically turns suspicious signals into investigation cases for your ops team; (2) UGC Agent – finds brand-relevant community conversations and suggests trust-safe responses; (3) Content Optimizer – improves post-scan education to give buyers clearer verification guidance. The vision is to make verification autonomous and continuous, not a one-time check.`
  },
];

const faqsRight = [
  {
    question: 'Which verification channels does EmbodiTrust support?',
    answer: 'EmbodiTrust supports two verification channels: (1) QR codes – customers scan a QR code embedded on the product or packaging; (2) Scratch codes – customers manually enter a 12-character alphanumeric code (e.g., ABC4H8K2M9X01) from a scratch-off panel. Both channels feed into the same verification API endpoint (/api/verify), which sanitizes input, looks up the code, checks its status, logs the verification attempt, and returns an instant response (valid, invalid, already_used, or suspected_counterfeit).'
  },
  {
    question: 'How do topics and risk queries work?',
    answer: `Topics are custom verification scenarios defined for your brand and products (e.g., "Genuine Electronics from Authorized Distributor"). Risk queries are automatically generated evaluation rules that check verification behavior against those topics—without manual setup required. For example: a query might flag "multiple 'already used' scans from different IPs on the same code" as a counterfeit signal, or "code verified from Nigeria and then US within 30 minutes" as geolocation anomaly. The engine generates these queries from your brand context and continuously evaluates them.`
  },
  {
    question: 'How does EmbodiTrust generate risk queries?',
    answer: 'EmbodiTrust generates risk queries by analyzing: (1) Your brand and product context (industry, typical geographies, expected scan volumes); (2) The verification data it collects (code status, verification timestamps, IP locations, failed attempt patterns); (3) Industry-known counterfeiting tactics (replay attacks, brute-force code guessing, geolocation spoofing). The system then creates automated rules—no manual configuration needed—that continuously scan incoming verification attempts and flag outliers. For example, if 50 codes from a single batch suddenly fail verification from a single IP in quick succession, that triggers a "failed attempt spike" alert.'
  },
  // {
  //   question: 'How does EmbodiTrust collect and organize suspicious evidence?',
  //   answer: `EmbodiTrust maintains two collections: (1) codes collection – stores each unique code with: _id, hashedCode, status, batchId, createdAt, firstVerifiedAt, firstVerifiedFromIP (hashed), and firstVerifiedLocation. (2) verification_attempts collection – logs every scan with: timestamp, scannedCode, result (status returned), ipAddress (hashed), userAgent, and approximateLocation. This dual structure lets you track both the lifecycle of a single code and the aggregate traffic patterns. Admins see a "Suspicious Activity" section in the dashboard listing flagged events (geolocation mismatches, failed spikes, duplicate "already used" scans) with evidence links.`
  // },
  {
    question: 'How do we get started with EmbodiTrust?',
    answer: `Getting started is simple: (1) Sign up and book a demo at emboditrust.com; (2) Work with our team to define your brand context (products, geographies, compliance needs); (3) Receive API credentials for the /api/verify endpoint and admin dashboard access; (4) Generate your first batch of codes (with 3-letter brand prefix, 6 random chars, 3-digit Luhn checksum mod 36); (5) Distribute codes on products (as QR or scratch); (6) Monitor verification activity and suspicious alerts in your dashboard. The entire setup takes less than a week. Our team provides onboarding and training for your ops and compliance staff.`
  },
];

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  return (
    <main className="min-h-screen bg-[#e8ebf0] bg-texture text-[#0b1c2e] transition-colors duration-300 dark:bg-[#333333] dark:text-[#f3f4f6] [font-family:Urbanist,Outfit,Montserrat,ui-sans-serif]">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes heroGlow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.6));
          }
        }
        @keyframes sectionFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes sheenSweep {
          0% {
            transform: translateX(-130%);
            opacity: 0;
          }
          20% {
            opacity: 0.35;
          }
          60% {
            opacity: 0.2;
          }
          100% {
            transform: translateX(180%);
            opacity: 0;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        .animate-hero-glow {
          animation: heroGlow 3s ease-in-out infinite;
        }
        .illustration-reveal {
          animation: fadeInUp 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        .section-intro-pill {
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.7s ease-out forwards, sectionFloat 4.8s ease-in-out infinite;
          opacity: 0;
        }
        .section-intro-pill::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 42%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
          animation: sheenSweep 3.8s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-texture {
          background-image: radial-gradient(circle, rgba(71,85,105,0.2) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-texture {
          background-image: radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
      <div className="sticky top-0 z-50 mx-auto w-full max-w-6xl px-5 pt-4 md:px-8 md:pt-5">
        <header className="rounded-xl border border-[#d7dde6] bg-white/95 shadow-md backdrop-blur transition-colors duration-300 dark:border-[#5a5a5a] dark:bg-[#3a3a3a]/95">
          <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-5">
            <Link href="/" className="flex items-center gap-2.5 text-base font-bold md:text-lg">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-400 text-[11px] font-black text-slate-900">E</span>
              <span>EmbodiTrust</span>
            </Link>

            <nav className="hidden items-center gap-6 text-lg font-bold text-slate-700 dark:text-slate-200 md:flex">
              <Link href="#engine" className="hover:text-slate-900 dark:hover:text-white">Engine</Link>
              <Link href="#agent-team" className="hover:text-slate-900 dark:hover:text-white">Agents</Link>
              <Link href="#industry" className="hover:text-slate-900 dark:hover:text-white">Industries</Link>
              <Link href="#faqs" className="hover:text-slate-900 dark:hover:text-white">FAQs</Link>
              <Link href="#contact" className="hover:text-slate-900 dark:hover:text-white">Contact</Link>
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
              <Link href="#contact" className="rounded-md bg-[#042333] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#053049] dark:bg-[#5d5d5d] dark:text-white dark:hover:bg-[#6a6a6a]">Book a Demo</Link>
              {/*
              <Link href="/admin-login" className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">
                Admin Log In
              </Link>
              */}
            </div>
          </div>
        </header>
      </div>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-5 px-5 pb-16 pt-12 md:grid-cols-2 md:px-4 md:pb-20 md:pt-16">
        <div>
          <TypeWriter 
            text={['Make Your Products', 'Discoverable', 'As Verified Originals']}
            className="text-5xl font-black leading-[0.95] md:text-7xl"
          />
          <p className="mt-6 max-w-md animate-fade-in-up text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg" style={{ animationDelay: '0.3s' }}>
            EmbodiTrust helps teams measure, monitor, and improve verification confidence across every channel in the supply chain.
          </p>

          <div className="mt-6 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link href="#contact" className="rounded-md bg-[#032434] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a]">Get a Demo</Link>
            <Link href="#engine" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 dark:hover:text-white">
              Explore Capabilities <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {/*
            <Link href="/admin-login" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
              Admin Log In <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            */}
          </div>
        </div>

        <div className="relative illustration-reveal">
          <div className="absolute -left-6 top-8 h-40 w-40 rounded-full bg-[#ffd8df] blur-2xl animate-hero-glow" />
          <div className="absolute -right-6 bottom-8 h-40 w-40 rounded-full bg-[#c4f4f2] blur-2xl animate-hero-glow" style={{ animationDelay: '0.5s' }} />
          <div className="relative   p-4  md:p-6 overflow-hidden">
            <img 
              src="/illustrations/engineer (1).svg" 
              alt="Product verification and authentication"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-5 pb-14 text-center md:px-8 md:pb-20">
        <h2 className="text-3xl font-black leading-tight md:text-5xl">
          50% of counterfeit incidents can be
          <br />
          prevented with active verification by 2028.
        </h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">EmbodiTrust Industry Benchmark</p>

        <div className="mx-auto mt-7 max-w-xl rounded-xl border border-[#cfd7e3] bg-white p-6 text-left shadow-sm transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]">
          <div className="flex items-center gap-3">
            <img
              src="/illustrations/man-with-long-hair-avatar.svg"
              alt="EmbodiTrust Product Team avatar"
              className="h-16 w-16  rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-bold">EmbodiTrust Product Team</p>
              <p className="text-md text-slate-500 dark:text-slate-300">Product & Verification Intelligence</p>
            </div>
          </div>
          <p className="mt-2  text-md leading-6 text-slate-700 dark:text-slate-200">
            Verification should not stop at a successful scan. Teams need continuous monitoring, anomaly detection,
            and action-ready evidence to protect customers and revenue.
          </p>
        </div>
      </section>

      <section id="engine" className="mx-auto w-full max-w-6xl px-5 pb-10 text-center md:px-8 md:pb-12">
        <div className="section-intro-pill mx-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-400 bg-cyan-50 px-[4rem] py-[1rem] text-[16px] font-semibold text-cyan-700 dark:border-cyan-300/50 dark:bg-cyan-500/15 dark:text-cyan-200" style={{ animationDelay: '0.08s, 0.85s' }}>
          <TbBrandLivewire className="h-6 w-6" />
          Live
        </div>
        <h3 className="mt-4 text-4xl font-black md:text-5xl animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
          Verification Intelligence Engine<span className="text-rose-500">.</span>
        </h3>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300 animate-fade-in-up" style={{ animationDelay: '0.24s' }}>Verification signals and authenticity evidence you can trust.</p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-12 md:px-8 md:pb-20">
        <div className="space-y-7">
          {featureRows.map((row, index) => (
            <article
              key={row.title}
              className={`grid items-center gap-6 rounded-2xl p-4 md:grid-cols-2 md:gap-8 md:p-6 transition-all duration-700 ${index % 2 === 1 ? 'bg-[#c9f1ef] dark:bg-[#44514f]' : 'dark:bg-[#3a3a3a]/35'}`}
              style={{
                animation: `fadeInUp 0.8s ease-out ${0.2 + index * 0.15}s forwards`,
                opacity: 0,
              }}
            >
              <div className={row.reverse ? 'md:order-2' : ''}>
                <h4 className="text-2xl font-black leading-tight md:text-4xl">{row.title}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200 md:text-base">{row.description}</p>
              </div>
              <div className={row.reverse ? 'md:order-1' : ''}>
                <div className="transition-all duration-500">
                  <FeatureIllustration variant={index} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="agent-team" className="mx-auto w-full max-w-6xl px-5 pb-14 text-center md:px-8 md:pb-20">
        <div className="section-intro-pill mx-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-400 bg-cyan-50 px-[4rem] py-[1rem] text-[16px] font-semibold text-cyan-700 dark:border-cyan-300/50 dark:bg-cyan-500/15 dark:text-cyan-200" style={{ animationDelay: '0.08s, 0.85s' }}>
          <UsersRound className="h-6 w-6" />
          Roadmap
        </div>
        <h3 className="mt-4 text-4xl font-black md:text-5xl animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
          Your Verification Agent Team<span className="text-rose-500">.</span>
        </h3>
        <p className="mx-auto mt-3 max-w-3xl text-lg text-slate-600 dark:text-slate-300 animate-fade-in-up" style={{ animationDelay: '0.24s' }}>
          The future of trust operations is autonomous. We are building verification agents to support enterprise teams.
        </p>

        <div className="mt-10 space-y-8 text-left">
          {agentCards.map((card, idx) => (
            <article 
              key={card.title} 
              className={`grid items-center gap-6 md:grid-cols-2 transition-all duration-700 ${idx % 2 === 1 ? 'md:[&>div:first-child]:order-2 md:[&>div:last-child]:order-1' : ''}`}
              style={{
                animation: `fadeInUp 0.8s ease-out ${0.3 + idx * 0.15}s forwards`,
                opacity: 0,
              }}
            >
              <div className="rounded-3xl bg-transparent p-3 transition-transform duration-500 hover:scale-105">
                <AgentIllustration variant={idx} />
              </div>
              <div>
                <h4 className="mt-4 text-3xl font-black md:text-4xl">{card.title}</h4>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-700 dark:text-slate-200 md:text-base">{card.description}</p>
                <Link href="#contact" className="mt-4 inline-block rounded-md bg-[#032434] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-slate-400/50 dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a] dark:hover:shadow-black/30">
                  Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="industry" className="mx-auto w-full max-w-6xl px-5 pb-14 text-center md:px-8 md:pb-20">
        <div className="section-intro-pill mx-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-400 bg-cyan-50 px-[4rem] py-[1rem] text-[16px] font-semibold text-cyan-700 dark:border-cyan-300/50 dark:bg-cyan-500/15 dark:text-cyan-200" style={{ animationDelay: '0.08s, 0.85s' }}>
          <Building2 className="h-6 w-6" />
          Industry Solutions
        </div>
        <h3 className="mt-4 text-4xl font-black md:text-5xl animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
          Verification Intelligence For Every Industry<span className="text-rose-500">.</span>
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300 animate-fade-in-up" style={{ animationDelay: '0.24s' }}>
          EmbodiTrust serves forward-looking brands that are serious about winning product trust.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {industries.map((item) => {
            return (
              <article key={item.name} className="rounded-xl border border-[#d3dbe7] bg-white p-4 text-left shadow-sm transition-colors dark:border-[#575757] dark:bg-[#3d3d3d]">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200">
                  <IndustryTileIcon kind={item.kind} />
                </div>
                <h4 className="text-base font-bold">{item.name}</h4>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                  Learn More <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="faqs" className="mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
        <div className="section-intro-pill mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-400 bg-cyan-50 px-[4rem] py-[1rem] text-[16px] font-semibold text-cyan-700 dark:border-cyan-300/50 dark:bg-cyan-500/15 dark:text-cyan-200" style={{ animationDelay: '0.08s, 0.85s' }}>
          <CircleHelp className="h-6 w-6" />
          FAQs
        </div>
        <h3 className="text-center text-4xl font-black md:text-5xl animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
          Read The FAQs<span className="text-rose-500">.</span>
        </h3>

        <div className="mt-10 grid gap-x-10 gap-y-2 md:grid-cols-2">
          <FaqColumn items={faqsLeft} />
          <FaqColumn items={faqsRight} />
        </div>
      </section>

      <ContactForm />

      <footer id="demo" className="bg-[#032434] text-white transition-colors dark:bg-[#2f2f2f]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:px-8 md:py-12">
          <div>
            <div className="flex items-center gap-2 text-3xl font-black">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400 text-sm font-black text-[#032434]">E</span>
              EmbodiTrust
            </div>
            <p className="mt-3 text-slate-200">Measure and grow your product authenticity visibility.</p>
          </div>

          <div className="flex items-end gap-4 text-sm text-slate-200">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms & Conditions</Link>
            <Link href="#" className="hover:text-white">Cookie Policy</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FaqColumn({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="divide-y divide-[#cfd7e3] border-t border-[#cfd7e3] dark:divide-[#585858] dark:border-[#585858]">
      {items.map((item) => (
        <div key={item.question}>
          <button
            type="button"
            onClick={() => setExpanded(expanded === item.question ? null : item.question)}
            className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-slate-800 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
          >
            <span>{item.question}</span>
            <Plus
              className={`h-4 w-4 text-slate-500 dark:text-slate-300 transition-transform duration-300 ${
                expanded === item.question ? 'rotate-45 transform' : ''
              }`}
            />
          </button>
          {expanded === item.question && (
            <div className="overflow-hidden pb-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TypeWriter({ text, className }: { text: string[]; className: string }) {
  const [displayText, setDisplayText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex < text.length) {
      const line = text[currentLineIndex];
      
      if (currentCharIndex < line.length) {
        const timer = setTimeout(() => {
          setDisplayText(prev => prev + line[currentCharIndex]);
          setCurrentCharIndex(prev => prev + 1);
        }, 30);
        
        return () => clearTimeout(timer);
      } else {
        // Move to next line
        const timer = setTimeout(() => {
          setDisplayText(prev => prev + '\n');
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 200);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentLineIndex, currentCharIndex, text]);

  return (
    <h1 className={className}>
      {displayText.split('\n').map((line, idx) => (
        <span key={idx}>
          {line}
          {idx < text.length - 1 && <br />}
        </span>
      ))}
      {currentLineIndex < text.length && <span className="animate-pulse">|</span>}
    </h1>
  );
}

function FeatureIllustration({ variant }: { variant: number }) {
  const illustrations = [
    {
      src: '/illustrations/creative-work.svg',
      alt: 'Team collaborating on verification intelligence',
    },
    {
      src: '/illustrations/businessman-with-a-suitcase.svg',
      alt: 'Engineer reviewing automated risk queries',
    },
    {
      src: '/illustrations/sales.svg',
      alt: 'Operational team working with verification evidence',
    },
    {
      src: '/illustrations/shaking-hands (1).svg',
      alt: 'Business growth driven by authenticity insights',
    },
  ];

  const illustration = illustrations[variant] ?? illustrations[0];

  return (
    <img
      src={illustration.src}
      alt={illustration.alt}
      className="h-auto w-full max-h-[24rem] object-contain contrast-125 saturate-125 transition-transform duration-500 hover:scale-[1.02] md:max-h-[30rem]"
      loading="lazy"
    />
  );
}

function AgentIllustration({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 340 220" preserveAspectRatio="xMidYMid meet" className="h-auto w-full max-h-[220px]" aria-hidden="true">
        <ellipse cx="138" cy="128" rx="104" ry="84" fill="#ff4d4f" opacity="0.9" />
        <ellipse cx="166" cy="160" rx="88" ry="52" fill="#c7f1ef" />
        <circle cx="142" cy="90" r="24" fill="#fff" stroke="#0d1f31" strokeWidth="2" />
        <rect x="96" y="116" width="98" height="62" rx="20" fill="#fff" stroke="#0d1f31" strokeWidth="2" />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg viewBox="0 0 340 220" preserveAspectRatio="xMidYMid meet" className="h-auto w-full max-h-[220px]" aria-hidden="true">
        <ellipse cx="200" cy="126" rx="108" ry="84" fill="#a6a7ff" />
        <path d="M140 172 C170 102, 232 92, 256 156" fill="#fff" stroke="#0d1f31" strokeWidth="2" />
        <circle cx="192" cy="96" r="22" fill="#fff" stroke="#0d1f31" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 340 220" preserveAspectRatio="xMidYMid meet" className="h-auto w-full max-h-[220px]" aria-hidden="true">
      <ellipse cx="166" cy="134" rx="96" ry="80" fill="#c9d2df" />
      <path d="M112 174 C128 114, 200 108, 220 168" fill="#fff" stroke="#0d1f31" strokeWidth="2" />
      <circle cx="170" cy="94" r="22" fill="#fff" stroke="#0d1f31" strokeWidth="2" />
    </svg>
  );
}

function IndustryTileIcon({
  kind,
}: {
  kind:
    | 'travel'
    | 'commerce'
    | 'finance'
    | 'health'
    | 'auto'
    | 'education'
    | 'real-estate'
    | 'legal'
    | 'saas'
    | 'crypto';
}) {
  const common = {
    stroke: '#0d1f31',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" aria-hidden="true">
      {kind === 'travel' && (
        <>
          <path d="M3 14H17" {...common} />
          <path d="M4 11L10 6L16 11" {...common} />
          <circle cx="10" cy="6" r="1.5" fill="#22d3ee" />
        </>
      )}
      {kind === 'commerce' && (
        <>
          <rect x="4" y="6" width="12" height="9" rx="2" {...common} />
          <path d="M7 6V4.8C7 4 7.7 3.3 8.5 3.3H11.5C12.3 3.3 13 4 13 4.8V6" {...common} />
          <circle cx="14.8" cy="11" r="1.2" fill="#22d3ee" />
        </>
      )}
      {kind === 'finance' && (
        <>
          <path d="M4 15V10" {...common} />
          <path d="M8 15V7" {...common} />
          <path d="M12 15V9" {...common} />
          <path d="M16 15V5" {...common} />
          <circle cx="16" cy="5" r="1.2" fill="#22d3ee" />
        </>
      )}
      {kind === 'health' && (
        <>
          <rect x="4" y="5" width="12" height="10" rx="2" {...common} />
          <path d="M10 7V13" {...common} />
          <path d="M7 10H13" {...common} />
          <circle cx="5" cy="5" r="1.1" fill="#22d3ee" />
        </>
      )}
      {kind === 'auto' && (
        <>
          <path d="M4 12L6 8H14L16 12" {...common} />
          <rect x="4" y="11" width="12" height="4" rx="1.5" {...common} />
          <circle cx="7" cy="15" r="1" fill="#22d3ee" />
          <circle cx="13" cy="15" r="1" fill="#22d3ee" />
        </>
      )}
      {kind === 'education' && (
        <>
          <path d="M3 8L10 5L17 8L10 11L3 8Z" {...common} />
          <path d="M6 9.5V12.5C6 13.7 7.9 14.7 10 14.7C12.1 14.7 14 13.7 14 12.5V9.5" {...common} />
          <circle cx="17" cy="8" r="1.1" fill="#22d3ee" />
        </>
      )}
      {kind === 'real-estate' && (
        <>
          <path d="M4 15V8L10 4L16 8V15" {...common} />
          <path d="M8.5 15V11H11.5V15" {...common} />
          <circle cx="15.5" cy="5" r="1.2" fill="#22d3ee" />
        </>
      )}
      {kind === 'legal' && (
        <>
          <path d="M10 5V15" {...common} />
          <path d="M6 7H14" {...common} />
          <path d="M5 7L3.5 10H6.5L5 7Z" {...common} />
          <path d="M15 7L13.5 10H16.5L15 7Z" {...common} />
          <circle cx="10" cy="4" r="1.1" fill="#22d3ee" />
        </>
      )}
      {kind === 'saas' && (
        <>
          <rect x="3.5" y="4" width="13" height="12" rx="2" {...common} />
          <path d="M3.5 7.5H16.5" {...common} />
          <path d="M6.5 11H9.5" {...common} />
          <path d="M11 11H13.5" {...common} />
          <circle cx="6" cy="6" r="0.9" fill="#22d3ee" />
        </>
      )}
      {kind === 'crypto' && (
        <>
          <circle cx="10" cy="10" r="5.2" {...common} />
          <path d="M8.2 8.1H10.8C11.4 8.1 11.9 8.5 11.9 9.1C11.9 9.7 11.4 10.1 10.8 10.1H9.3C8.6 10.1 8.1 10.6 8.1 11.2C8.1 11.8 8.6 12.2 9.3 12.2H11.8" {...common} />
          <path d="M10 7V13" {...common} />
          <circle cx="14.8" cy="6" r="1.1" fill="#22d3ee" />
        </>
      )}
    </svg>
  );
}
