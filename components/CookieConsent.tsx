'use client';

import { useEffect, useMemo, useState } from 'react';
import { Cookie, Settings2, ShieldCheck } from 'lucide-react';

type CookieConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const CONSENT_COOKIE_KEY = 'emboditrust_cookie_consent';
const ANALYTICS_COOKIE_KEY = 'emboditrust_cookie_analytics';
const MARKETING_COOKIE_KEY = 'emboditrust_cookie_marketing';
const COOKIE_LIFETIME_DAYS = 180;

function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function getCookie(name: string): string | null {
  const target = `${name}=`;
  const pairs = document.cookie.split(';');

  for (const raw of pairs) {
    const item = raw.trim();
    if (item.startsWith(target)) {
      return decodeURIComponent(item.slice(target.length));
    }
  }

  return null;
}

function saveConsent(consent: CookieConsentState) {
  setCookie(CONSENT_COOKIE_KEY, JSON.stringify(consent), COOKIE_LIFETIME_DAYS);
  setCookie(ANALYTICS_COOKIE_KEY, consent.analytics ? 'granted' : 'denied', COOKIE_LIFETIME_DAYS);
  setCookie(MARKETING_COOKIE_KEY, consent.marketing ? 'granted' : 'denied', COOKIE_LIFETIME_DAYS);
}

function buildConsent(analytics: boolean, marketing: boolean): CookieConsentState {
  return {
    necessary: true,
    analytics,
    marketing,
    updatedAt: new Date().toISOString(),
  };
}

function readStoredConsent(): CookieConsentState | null {
  const raw = getCookie(CONSENT_COOKIE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [hasDecision, setHasDecision] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = readStoredConsent();

    if (stored) {
      setHasDecision(true);
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
      setIsBannerOpen(false);
      return;
    }

    setHasDecision(false);
    setIsBannerOpen(true);
  }, []);

  const summaryText = useMemo(() => {
    if (analytics && marketing) {
      return 'Analytics and marketing cookies enabled';
    }
    if (analytics && !marketing) {
      return 'Analytics enabled, marketing disabled';
    }
    if (!analytics && marketing) {
      return 'Marketing enabled, analytics disabled';
    }
    return 'Only necessary cookies enabled';
  }, [analytics, marketing]);

  const acceptAll = () => {
    const consent = buildConsent(true, true);
    saveConsent(consent);
    setAnalytics(true);
    setMarketing(true);
    setHasDecision(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  };

  const rejectOptional = () => {
    const consent = buildConsent(false, false);
    saveConsent(consent);
    setAnalytics(false);
    setMarketing(false);
    setHasDecision(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  };

  const savePreferences = () => {
    const consent = buildConsent(analytics, marketing);
    saveConsent(consent);
    setHasDecision(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {isBannerOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 md:px-6 md:pb-6">
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-[#cad4e2] bg-white p-4 shadow-xl md:p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-cyan-50 text-cyan-700">
                <Cookie className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-[#0b1c2e] md:text-lg">We use cookies</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  We use necessary cookies to keep the site secure and optional cookies for analytics and marketing.
                  You can accept all, reject optional cookies, or customize your preferences.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="rounded-md bg-[#032434] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#04324a]"
                  >
                    Accept All
                  </button>

                  <button
                    type="button"
                    onClick={rejectOptional}
                    className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Reject Optional
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreferencesOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
                  >
                    <Settings2 className="h-4 w-4" />
                    Manage Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasDecision && !isBannerOpen && (
        <button
          type="button"
          onClick={() => setIsPreferencesOpen(true)}
          className="fixed bottom-4 left-4 z-[80] inline-flex items-center gap-1.5 rounded-full border border-[#cad4e2] bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-50"
          aria-label="Open cookie settings"
        >
          <Cookie className="h-4 w-4" />
          Cookie Settings
        </button>
      )}

      {isPreferencesOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#cad4e2] bg-white p-5 shadow-2xl md:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-700" />
              <h3 className="text-lg font-black text-[#0b1c2e]">Cookie Preferences</h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Control how EmbodiTrust uses cookies. Necessary cookies are always on because they keep core features working.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#d6deea] bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0b1c2e]">Necessary Cookies</p>
                    <p className="text-xs text-slate-600">Security, authentication, and core functionality.</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">Always On</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#d6deea] bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0b1c2e]">Analytics Cookies</p>
                    <p className="text-xs text-slate-600">Help us understand usage patterns and improve the platform.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-cyan-700"
                    aria-label="Enable analytics cookies"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#d6deea] bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0b1c2e]">Marketing Cookies</p>
                    <p className="text-xs text-slate-600">Used for campaign attribution and personalized promotions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-cyan-700"
                    aria-label="Enable marketing cookies"
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">Current selection: {summaryText}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-md bg-[#032434] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#04324a]"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
