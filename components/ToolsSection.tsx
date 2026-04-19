'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const tabs = [
  {
    label: 'Code Issuance',
    title: 'Secure code batches for any packaging line',
    description:
      'Generate tamper-resistant QR and scratch codes in bulk, assign them to products or batches, and maintain full audit trails from production to shelf.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Verification',
    title: 'Instant authenticity outcomes at point of purchase',
    description:
      'Consumers, pharmacists, and distributors scan or enter codes online or via SMS to get an immediate genuine or suspicious result — no app needed.',
    image:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Distribution',
    title: 'Track product movement across your supply chain',
    description:
      'Monitor where verified scans are happening in real time so your team can spot diversion, grey markets, and stockout risk before they escalate.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Engagement',
    title: 'Loyalty rewards and feedback after every genuine scan',
    description:
      'After a successful verification, trigger personalised offers, product information, warranty registration, or review prompts to build long-term trust.',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
  },
];

const stats = [
  { value: '31,203+', label: 'verifications today' },
  { value: '99.9%', label: 'platform uptime target' },
  { value: '4.8/5', label: 'partner satisfaction' },
];

export default function ToolsSection() {
  const [activeIndex, setActiveIndex] = useState(1);
  const active = tabs[activeIndex];

  return (
    <section id="features" className="py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Every tool you need is here...
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px_1fr_1fr]">
          {/* Tab rail */}
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              {tabs.map((tab, index) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left text-sm transition-colors last:border-b-0 ${
                    index === activeIndex
                      ? 'bg-emerald-50 font-semibold text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${index === activeIndex ? 'rotate-90 text-emerald-600' : ''}`}
                  />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Active feature card */}
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-emerald-50 shadow-sm lg:col-span-2">
            <CardContent className="grid gap-0 p-0 md:grid-cols-2">
              <div className="flex flex-col justify-center p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {active.label}
                </p>
                <h3 className="text-xl font-semibold text-slate-900">{active.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{active.description}</p>
                <Button
                  asChild
                  className="mt-5 w-fit rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Link href="#contact">Learn more</Link>
                </Button>
              </div>
              <img
                src={active.image}
                alt={active.title}
                className="h-64 w-full object-cover md:h-full md:rounded-r-2xl"
              />
            </CardContent>
          </Card>
        </div>

        {/* Stats + advice strip */}
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-2xl border-slate-200 bg-white shadow-sm md:col-span-1"
            >
              <CardContent className="p-5">
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}

          <Card className="rounded-2xl border-emerald-100 bg-emerald-50 shadow-sm md:col-span-2">
            <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-900">Need some advice?</p>
                <p className="mt-1 text-sm text-slate-600">
                  99% of our consultations help teams launch verification faster.
                </p>
              </div>
              <Button
                asChild
                className="w-fit shrink-0 rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Link href="#contact">Talk to our team</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
