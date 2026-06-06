"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Code,
  Palette,
  Smartphone,
  Puzzle,
  AlertTriangle,
  Globe,
  ExternalLink,
  Terminal,
  Blocks,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://emboditrust.com";

const HIGHLIGHT_CSS = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css";
const HIGHLIGHT_JS = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js";

const code = {
  quickstart: `<!-- 1. Add a container div where the widget should appear -->
<div id="emboditrust-verify"></div>

<!-- 2. Load the widget script -->
<script src="${APP_URL}/widget.js"><\/script>

<!-- 3. Initialize the widget -->
<script>
EmbodiTrust.init({
  container: "#emboditrust-verify",
  verificationCode: "QR-EMB-XXXXXXXX-XXXXX",
  companyName: "Your Company Name",
  logoUrl: "https://your-site.com/logo.png",
  primaryColor: "#2957FF",
  secondaryColor: "#0B0F19",
  accentColor: "#19a35b",
  supportEmail: "support@yourcompany.com",
  supportPhone: "+2348000000000",
  verificationHeadline: "Product Verification",
  verificationDescription: "Verify the authenticity of this product"
});
<\/script>`,

  options: `{
  // Required: CSS selector for the container element
  container: "#emboditrust-verify",

  // Required: The product verification code (from QR code)
  verificationCode: "QR-EMB-XXXXXXXX-XXXXX",

  // Optional: Override the company name shown in the widget
  companyName: "Your Company",

  // Optional: URL to your company logo image
  logoUrl: "https://example.com/logo.png",

  // Optional: Primary brand color (hex)
  primaryColor: "#2957FF",

  // Optional: Secondary brand color (hex)
  secondaryColor: "#0B0F19",

  // Optional: Accent color for success states (hex)
  accentColor: "#19a35b",

  // Optional: Support email displayed in the widget
  supportEmail: "support@yourcompany.com",

  // Optional: Support phone number displayed in the widget
  supportPhone: "+2348000000000",

  // Optional: Custom headline text
  verificationHeadline: "Product Verification",

  // Optional: Custom description text
  verificationDescription: "Verify the authenticity of this product"
}`,

  react: `import { useEffect, useRef } from 'react';

export default function VerifyProduct({ code }: { code: string }) {
  const instanceRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${APP_URL}/widget.js';
    script.async = true;

    script.onload = () => {
      instanceRef.current = window.EmbodiTrust.init({
        container: '#et-widget-' + code,
        verificationCode: code,
        companyName: "Your Company"
      });
    };

    document.body.appendChild(script);

    return () => {
      if (instanceRef.current) {
        window.EmbodiTrust.destroy('#et-widget-' + code);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [code]);

  return <div id={'et-widget-' + code} />;
}`,

  vue: `<template>
  <div :id="containerId"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  verificationCode: { type: String, required: true }
});

const containerId = ref('et-widget-' + props.verificationCode);
let instance = null;

function loadWidget() {
  if (window.EmbodiTrust) {
    instance = window.EmbodiTrust.init({
      container: '#' + containerId.value,
      verificationCode: props.verificationCode,
      companyName: "Your Company"
    });
    return;
  }

  const script = document.createElement('script');
  script.src = '${APP_URL}/widget.js';
  script.async = true;
  script.onload = () => {
    instance = window.EmbodiTrust.init({
      container: '#' + containerId.value,
      verificationCode: props.verificationCode,
      companyName: "Your Company"
    });
  };
  document.body.appendChild(script);
}

onMounted(loadWidget);
onUnmounted(() => {
  if (instance) window.EmbodiTrust.destroy('#' + containerId.value);
});
<\/script>`,

  nextjs: `'use client';

import { useEffect, useRef } from 'react';

interface Props {
  verificationCode: string;
  companyName?: string;
  logoUrl?: string;
}

export default function EmbodiTrustWidget({
  verificationCode,
  companyName = 'Your Company',
  logoUrl = ''
}: Props) {
  const containerId = \`et-widget-\${verificationCode}\`;
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const init = () => {
      if (window.EmbodiTrust) {
        instanceRef.current = window.EmbodiTrust.init({
          container: \`#\${containerId}\`,
          verificationCode,
          companyName,
          logoUrl
        });
        return;
      }

      const script = document.createElement('script');
      script.src = '${APP_URL}/widget.js';
      script.async = true;
      script.onload = () => {
        if (window.EmbodiTrust) {
          instanceRef.current = window.EmbodiTrust.init({
            container: \`#\${containerId}\`,
            verificationCode,
            companyName,
            logoUrl
          });
        }
      };
      document.body.appendChild(script);
    };

    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
      return () => window.removeEventListener('load', init);
    }
  }, [verificationCode, companyName, logoUrl, containerId]);

  return <div id={containerId} />;
}`,

  vanilla: `// Programmatic usage without HTML container
const code = "QR-EMB-XXXXXXXX-XXXXX";

// Fetch product info first
EmbodiTrust.verify(code, function(err, data) {
  if (err) {
    console.error('Verification check failed:', err);
    return;
  }

  if (data.success) {
    console.log('Product:', data.data.productName);
    console.log('Company:', data.data.companyName);
    console.log('Status:', data.data.status);
  }

  // Then render the widget
  EmbodiTrust.init({
    container: "#emboditrust-verify",
    verificationCode: code,
    companyName: data.data.companyName,
    logoUrl: data.data.logoUrl
  });
});`,

  multiple: `<!-- Widget for product A -->
<div id="verify-product-a"></div>

<!-- Widget for product B -->
<div id="verify-product-b"></div>

<script src="${APP_URL}/widget.js"><\/script>
<script>
EmbodiTrust.init({
  container: "#verify-product-a",
  verificationCode: "QR-EMB-AAAAAAAA-11111",
  companyName: "Your Company"
});

EmbodiTrust.init({
  container: "#verify-product-b",
  verificationCode: "QR-EMB-BBBBBBBB-22222",
  companyName: "Your Company"
});
<\/script>`,

  destroy: `// Destroy a specific widget instance by container selector
EmbodiTrust.destroy("#emboditrust-verify");

// Store the instance from init() and destroy later
const widget = EmbodiTrust.init({ ... });
widget.destroy();

// Destroy all widget instances at once
EmbodiTrust.destroyAll();`,
};

interface Section {
  id: string;
  icon: any;
  title: string;
  desc: string;
  code: string;
  lang: string;
}

const sections: Section[] = [
  {
    id: "quickstart",
    icon: Terminal,
    title: "Quick Start",
    desc: "Add the widget to any HTML page in 3 steps.",
    code: code.quickstart,
    lang: "html",
  },
  {
    id: "options",
    icon: Palette,
    title: "Configuration Options",
    desc: "All available options for EmbodiTrust.init().",
    code: code.options,
    lang: "javascript",
  },
  {
    id: "react",
    icon: Blocks,
    title: "React / Next.js",
    desc: "Integrate the widget into a React or Next.js application.",
    code: code.react,
    lang: "typescript",
  },
  {
    id: "nextjs-component",
    icon: Blocks,
    title: "Next.js Client Component",
    desc: "A reusable Next.js client component for the widget.",
    code: code.nextjs,
    lang: "typescript",
  },
  {
    id: "vue",
    icon: Puzzle,
    title: "Vue.js",
    desc: "Use the widget inside a Vue 3 component.",
    code: code.vue,
    lang: "html",
  },
  {
    id: "vanilla",
    icon: Terminal,
    title: "Programmatic Usage",
    desc: "Use the API directly without the init helper.",
    code: code.vanilla,
    lang: "javascript",
  },
  {
    id: "multiple",
    icon: Smartphone,
    title: "Multiple Widgets",
    desc: "Display multiple verification widgets on one page.",
    code: code.multiple,
    lang: "html",
  },
  {
    id: "destroy",
    icon: AlertTriangle,
    title: "Cleanup & Destroy",
    desc: "Properly destroy widget instances when they are no longer needed.",
    code: code.destroy,
    lang: "javascript",
  },
];

export default function EmbedGuidePage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let link: HTMLLinkElement | null = null;
    let script: HTMLScriptElement | null = null;
    let highlightTimer: number | null = null;

    function highlight() {
      if (!(window as any).hljs) return;
      document.querySelectorAll("pre code").forEach((el) => {
        (window as any).hljs.highlightElement(el);
      });
    }

    function tryHighlight() {
      if ((window as any).hljs) {
        highlight();
        return;
      }
      highlightTimer = window.setTimeout(tryHighlight, 200);
    }

    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = HIGHLIGHT_CSS;
    document.head.appendChild(link);

    script = document.createElement("script");
    script.src = HIGHLIGHT_JS;
    script.async = true;
    script.onload = () => {
      highlight();
    };
    document.body.appendChild(script);

    tryHighlight();

    return () => {
      if (highlightTimer) clearTimeout(highlightTimer);
      if (link && document.head.contains(link)) document.head.removeChild(link);
      if (script && document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-bold"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-400 text-[11px] font-black text-slate-900">
              E
            </span>
            <span>EmbodiTrust</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#quickstart" className="text-gray-600 hover:text-gray-900">
              Quick Start
            </a>
            <a href="#options" className="text-gray-600 hover:text-gray-900">
              Options
            </a>
            <a href="#react" className="text-gray-600 hover:text-gray-900">
              React
            </a>
            <a href="#vue" className="text-gray-600 hover:text-gray-900">
              Vue
            </a>
            <Link
              href="https://emboditrust.com/#contact"
              className="rounded-md bg-[#042333] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#053049]"
            >
              Contact Support
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700">
            <Code className="h-4 w-4" />
            SDK Integration Guide
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Embed Verification on Your Site
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Add the EmbodiTrust verification widget to any website or web
            application. Your customers scan the QR code and verify product
            authenticity directly on your site.
          </p>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Add Container",
              desc: "Place a div where the widget should appear on your page.",
            },
            {
              step: "2",
              title: "Load Script",
              desc: "Include the widget.js script on your page. It loads asynchronously and won't slow down your site.",
            },
            {
              step: "3",
              title: "Initialize",
              desc: "Call EmbodiTrust.init() with your verification code and branding options.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-lg font-bold text-cyan-600">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-20">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-20"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
                    <Icon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600">{section.desc}</p>
                  </div>
                </div>

                <div className="relative">
                  <CopyButton code={section.code} />
                  <div className="absolute left-3 top-3 z-10 rounded-md bg-gray-700/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    {section.lang}
                  </div>
                  <pre
                    className="overflow-x-auto rounded-xl border border-gray-200 bg-[#282c34] p-5 pt-10 text-sm leading-6 shadow-sm"
                    style={{ background: "#282c34" }}
                  >
                    <code className={`language-${section.lang}`}>
                      {section.code}
                    </code>
                  </pre>
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-20 scroll-mt-20" id="troubleshooting">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                Troubleshooting
              </h2>
              <p className="text-sm text-gray-600">
                Common issues and how to fix them.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Widget does not appear on the page",
                a: "Make sure the container element exists in the DOM before calling EmbodiTrust.init(). If you are using a framework like React, initialize the widget inside a useEffect() or onMounted() hook after the component has rendered.",
              },
              {
                q: "Cross-Origin Resource Policy (CORS) errors",
                a:
                  "The widget loads content from " +
                  APP_URL +
                  " via an iframe. Ensure your Content-Security-Policy allows frame loading from " +
                  APP_URL +
                  ". Add frame-src " +
                  APP_URL +
                  " to your CSP headers.",
              },
              {
                q: "Widget height is incorrect or content is clipped",
                a: "The widget automatically resizes the iframe to match its content height. If you see clipping, ensure your site does not have CSS that overflows hidden on the container or its parent elements.",
              },
              {
                q: "Script is blocked by Content Security Policy",
                a:
                  "Add " +
                  APP_URL +
                  " to your script-src CSP directive: script-src " +
                  APP_URL +
                  " 'unsafe-inline';",
              },
              {
                q: "Multiple widgets interfering with each other",
                a: "Each widget must have a unique container ID. Pass different container selectors to each EmbodiTrust.init() call.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-gray-200 bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-gray-100 px-5 py-4 text-sm leading-6 text-gray-600">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-gray-500 md:px-6">
          &copy; {new Date().getFullYear()} EmbodiTrust. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  return (
    <div className="absolute right-3 top-3 z-10">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          const btn = document.activeElement;
          if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>';
            setTimeout(() => {
              if (btn) btn.innerHTML = original;
            }, 2000);
          }
        }}
        className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copy
      </button>
    </div>
  );
}
