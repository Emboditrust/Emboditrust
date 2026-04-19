import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Globe,
  MapPin,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react';
import Header from '@/components/Header';
import ToolsSection from '@/components/ToolsSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const trustCards: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Active Monitoring',
    description: 'Track live scans and verify every product interaction instantly.',
    icon: Activity,
  },
  {
    title: 'Zero Guesswork',
    description: 'Buyers and field teams see clear authenticity outcomes at once.',
    icon: BadgeCheck,
  },
  {
    title: 'Anti-Counterfeit Alerts',
    description: 'Spot suspicious code use, repeat scans, and market anomalies early.',
    icon: Shield,
  },
  {
    title: 'Consumer Trust Loop',
    description: 'Turn successful scans into education, offers, and feedback.',
    icon: Sparkles,
  },
];

const showcaseCards = [
  {
    label: 'Secure QR labels',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Scratch-and-verify codes',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'SMS verification flows',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Fraud analytics dashboard',
    image: 'https://images.unsplash.com/photo-1551281044-8b35a4f91754?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Retail scan journeys',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80',
  },
];

const deepFeatures = [
  {
    eyebrow: 'Guided rollout',
    title: 'Step-by-step guidance for rollout',
    description:
      'Launch verification campaigns with structured code generation, activation, monitoring, and response steps.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Post-scan rewards',
    title: 'Rewards and education after every genuine scan',
    description:
      'Use successful authentications to trigger loyalty benefits, product education, or support flows.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Fraud detection',
    title: 'Real-time fraud signal detection',
    description:
      'Repeated failures, risky locations, and unusual frequency patterns are escalated immediately.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Market mapping',
    title: 'Map counterfeit pressure across markets',
    description:
      'Identify where investigations are needed with geolocation trends and historical verification logs.',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Verified feedback',
    title: 'Collect verified buyer feedback',
    description:
      'Capture sentiment and experience data only from real purchasers after successful verification.',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    eyebrow: 'Team coordination',
    title: 'Coordinate with compliance and operations',
    description:
      'Give internal teams the context they need to react quickly to threats and protect revenue.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  },
];

const examples = [
  {
    label: 'Pharma serialization campaigns',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'FMCG retail authenticity checks',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Import verification programs',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Distributor stock investigations',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Consumer loyalty redemption flows',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80',
  },
];

const testimonials = [
  {
    rating: '4.9 out of 5',
    text: 'EmbodiTrust helped us reduce fake product complaints and gave our field team immediate evidence for investigations.',
    author: 'Operations Lead, Pharma Brand',
  },
  {
    rating: '5.0 out of 5',
    text: 'The verification journey is simple for buyers and the analytics are strong enough for weekly compliance reviews.',
    author: 'Compliance Manager, FMCG Group',
  },
  {
    rating: '4.8 out of 5',
    text: 'We finally have a clean view of suspicious scan clusters across multiple regions without manual reconciliation.',
    author: 'Distribution Director, Consumer Goods Company',
  },
  {
    rating: '4.9 out of 5',
    text: 'The post-scan engagement flow gave us both authenticity proof and a better channel to reach real customers.',
    author: 'Growth Lead, Retail Network',
  },
];

const insightCards = [
  {
    tag: 'FIELD GUIDE',
    title: 'How to stop counterfeit products with better verification design',
    tone: 'bg-rose-100',
  },
  {
    tag: 'PLAYBOOK',
    title: 'How to connect product authentication to loyalty campaigns',
    tone: 'bg-orange-100',
  },
  {
    tag: 'VIDEO',
    title: 'Best practices for onboarding field teams into verification workflows',
    tone: 'bg-slate-100',
  },
  {
    tag: 'VIDEO',
    title: 'How to use scan anomalies to identify diversion early',
    tone: 'bg-slate-100',
  },
  {
    tag: 'VIDEO',
    title: 'Launching a pharma verification flow without slowing packaging',
    tone: 'bg-slate-100',
  },
];

const faqs = [
  'What is product authentication?',
  'What is the difference between verification and traceability?',
  'How do I choose the right code format for my products?',
  'How far back should verification history be stored?',
  'What does a counterfeit hotspot signal mean?',
  'What response actions can be triggered after a suspicious scan?',
  'Is it worth pairing verification with loyalty campaigns?',
  'Should I use a different flow for pharmacies and retail stores?',
  'What makes EmbodiTrust effective for brand protection?',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <Header />

      <section className="pt-24 md:pt-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="overflow-hidden rounded-[28px] bg-[#edf3ff] px-6 py-8 md:px-10 md:py-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="max-w-xl space-y-5">
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-[56px] md:leading-[1.02]">
                  This verification platform helps you stop counterfeits in real time.
                </h1>
                <p className="text-base leading-7 text-slate-600 md:text-lg">
                  EmbodiTrust protects every product identity, gives buyers instant confidence,
                  and gives your team live intelligence on suspicious activity.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-500">
                    <Link href="#contact">Create my protection flow</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 bg-white px-6">
                    <Link href="#features">Upload my use case</Link>
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" />Works across web and SMS verification</p>
                  <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" />Built for national distribution networks</p>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[430px]">
                <div className="rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Live Verification</p>
                        <p className="text-lg font-semibold text-slate-900">Batch EV-24018</p>
                      </div>
                      <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
                        Authentic
                      </Badge>
                    </div>

                    <img
                      src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
                      alt="Product verification interface preview"
                      className="h-52 w-full rounded-2xl object-cover"
                    />

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Location</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">Lagos Mainland</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Status</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">Low risk signal</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-4 bottom-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Resolved scans</p>
                  <p className="text-2xl font-semibold text-emerald-700">11.5k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 flex items-center justify-center gap-2 text-center text-xl font-medium text-emerald-700 md:text-2xl">
            <Globe className="h-5 w-5" />
            <span>31,203 verifications completed today</span>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {trustCards.map((card) => {
              const Icon = card.icon;

              return (
                <Card key={card.title} className="rounded-2xl border-slate-200 bg-white shadow-sm">
                  <CardHeader className="gap-3 p-5">
                    <Icon className="h-5 w-5 text-slate-900" />
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <p className="text-sm leading-6 text-slate-500">{card.description}</p>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <ToolsSection />

      <section id="products" className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 text-center">
            <p className="text-sm text-slate-500">Choose the verification surface that matches your market.</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">Trusted verification templates</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {showcaseCards.map((item, index) => (
              <Card key={item.label} className={`overflow-hidden rounded-2xl border-slate-200 ${index === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-50'} shadow-sm`}>
                <CardContent className="p-4">
                  <div className="mb-3 overflow-hidden rounded-2xl">
                    <img src={item.image} alt={item.label} className="h-40 w-full object-cover" />
                  </div>
                  <p className="text-center text-sm font-medium">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Way beyond a verification website...</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deepFeatures.map((feature, index) => (
              <Card
                key={feature.title}
                className={`overflow-hidden rounded-2xl border-slate-200 shadow-sm ${index % 3 === 0 ? 'bg-emerald-50' : index % 3 === 1 ? 'bg-amber-50' : 'bg-slate-50'}`}
              >
                <CardContent className="p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{feature.eyebrow}</p>
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  <Link href="#contact" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="mt-5 h-44 w-full rounded-2xl object-cover"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="industries" className="bg-emerald-900 py-12 text-white md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm text-white/70">Protect markets with verified product experiences</p>
              <h2 className="text-3xl font-semibold md:text-4xl">Get the visibility you need with professional verification examples</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Use tested scan journeys, alert flows, and engagement patterns that work across regulated supply chains.
              </p>
              <Button asChild className="mt-6 rounded-full bg-emerald-400 text-slate-900 hover:bg-emerald-300">
                <Link href="#contact">Start your protection flow</Link>
              </Button>
              <div className="mt-8 flex items-center gap-2 text-emerald-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-2 text-sm text-white/80">4.8 out of 5 based on partner reviews</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((item) => (
                <Card key={item.label} className="overflow-hidden rounded-2xl border-0 bg-white text-slate-900 shadow-sm">
                  <CardContent className="p-4">
                    <img src={item.image} alt={item.label} className="h-48 w-full rounded-xl object-cover" />
                    <p className="mt-3 text-sm font-medium">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">92% of customers recommend us</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {testimonials.map((item) => (
              <Card key={item.author} className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-slate-900">{item.rating}</p>
                  <div className="mt-2 flex gap-1 text-emerald-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{item.text}</p>
                  <p className="mt-4 text-sm font-medium text-slate-500">{item.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Need some expert advice?</h2>
            <Link href="#contact" className="text-sm font-medium text-emerald-700">See more tips</Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {insightCards.slice(0, 2).map((card) => (
              <Card key={card.title} className={`rounded-2xl border-slate-200 ${card.tone} shadow-sm`}>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{card.tag}</p>
                  <h3 className="mt-3 max-w-md text-2xl font-semibold text-slate-900">{card.title}</h3>
                  <div className="mt-5 h-40 rounded-2xl bg-white/70" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {insightCards.slice(2).map((card) => (
              <Card key={card.title} className={`rounded-2xl border-slate-200 ${card.tone} shadow-sm`}>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">{card.tag}</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map((question) => (
              <details key={question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-slate-900 md:text-base">
                  <span>{question}</span>
                  <span className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="pt-3 text-sm leading-6 text-slate-600">
                  EmbodiTrust combines secure code management, verification, and response intelligence so brands can protect distribution networks without adding friction to buyers.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="overflow-hidden rounded-[28px] border-slate-200 bg-emerald-50 shadow-sm">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                  Join over <span className="text-emerald-600">31,203</span> protected product journeys.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                  Start now and give your team the systems needed to verify, monitor, and respond faster.
                </p>
              <Button asChild className="mt-6 w-fit rounded-full bg-emerald-600 text-white hover:bg-emerald-500">
                  <Link href="#contact">Create my protection flow</Link>
                </Button>
              </div>

              <div className="rounded-[24px] bg-white p-4">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80"
                  alt="EmbodiTrust customer"
                  className="h-64 w-full rounded-[20px] object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="contact" className="pb-12">
        <ContactForm />
      </section>

      <Footer />
    </main>
  );
}
