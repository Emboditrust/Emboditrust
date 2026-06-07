"use client";

import Link from "next/dist/client/link";
import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";

const EXAMPLES = [
  {
    label: "QR-THC-1780734955983-000004-VP2O",
    value: "QR-THC-1780734955983-000004-VP2O",
  },
];

export default function TestPage() {
  const [qrCodeId, setQrCodeId] = useState("");
  const [loadedCode, setLoadedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const containerId = "et-test-container";
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if ((window as any).EmbodiTrust) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "/widget.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const loadWidget = useCallback((code: string) => {
    if (instanceRef.current) {
      try {
        instanceRef.current.destroy();
      } catch {}
      instanceRef.current = null;
    }

    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";

    if (!(window as any).EmbodiTrust) {
      const msg = document.getElementById(containerId);
      if (msg)
        msg.innerHTML =
          '<p style="color:#ef4444;text-align:center;padding:40px;font-size:14px;">Widget script not loaded. Make sure widget.js is loaded on this page.</p>';
      return;
    }

    try {
      instanceRef.current = (window as any).EmbodiTrust.init({
        container: "#" + containerId,
        verificationCode: code,
        companyName: "EmbodiTrust Test",
        primaryColor: "#2957FF",
        secondaryColor: "#0B0F19",
        accentColor: "#19a35b",
        verificationHeadline: "Product Verification",
        verificationDescription: "Test verification for " + code,
      });
    } catch (e) {
      const msg = document.getElementById(containerId);
      if (msg)
        msg.innerHTML =
          '<p style="color:#ef4444;text-align:center;padding:40px;font-size:14px;">Error loading widget: ' +
          e +
          "</p>";
    }
  }, []);

  const handleLoad = () => {
    const code = qrCodeId.trim();
    if (!code) return;
    if (!scriptReady) {
      alert(
        "Widget script is still loading. Please wait a moment and try again.",
      );
      return;
    }
    setLoading(true);
    setLoadedCode(code);
    setTimeout(() => {
      loadWidget(code);
      setLoading(false);
    }, 100);
  };

  const handleClear = () => {
    if (instanceRef.current) {
      try {
        instanceRef.current.destroy();
      } catch {}
      instanceRef.current = null;
    }
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";
    setLoadedCode(null);
    setQrCodeId("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        .et-test-input { border: 2px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 15px; width: 100%; outline: none; transition: border-color 0.2s; font-family: monospace; letter-spacing: 0.5px; }
        .et-test-input:focus { border-color: #2957FF; box-shadow: 0 0 0 3px rgba(41,87,255,0.12); }
        .et-test-btn { border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px; }
        .et-test-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .et-test-spinner { width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: et-spin 0.6s linear infinite; display: inline-block; }
        @keyframes et-spin { to { transform: rotate(360deg); } }
      `}</style>
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
            <Link
              href="/"
              className="flex items-center gap-2.5 text-base font-bold md:text-lg"
            >
              <Image
                src="/logo.png"
                alt="EmbodiTrust"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full"
              />
              <span>EmbodiTrust</span>
            </Link>

            <nav className="hidden items-center gap-6 text-lg font-bold text-slate-700 dark:text-slate-200 md:flex">
              <Link
                href="#engine"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Engine
              </Link>
              <Link
                href="#agent-team"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Agents
              </Link>
              <Link
                href="#industry"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Industries
              </Link>
              <Link
                href="#faqs"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                FAQs
              </Link>
              <Link
                href="#contact"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-2.5">
              <Link
                href="#contact"
                className="rounded-md bg-[#042333] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#053049] dark:bg-[#5d5d5d] dark:text-white dark:hover:bg-[#6a6a6a]"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </header>
      </div>
      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 16px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Verification Test Sandbox
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "6px" }}>
            Enter a QR Code ID to preview the embedded verification widget.
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            marginBottom: "24px",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#475569",
              marginBottom: "8px",
            }}
          >
            QR Code ID
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                className="et-test-input"
                value={qrCodeId}
                onChange={(e) => setQrCodeId(e.target.value.toUpperCase())}
                placeholder="QR-XXX-XXXXXXXXX-XXXXX"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLoad();
                }}
                autoFocus
              />
            </div>
            <button
              className="et-test-btn"
              onClick={handleLoad}
              disabled={!qrCodeId.trim() || loading}
              style={{
                background: "#2957FF",
                color: "white",
                minWidth: "100px",
                justifyContent: "center",
              }}
            >
              {loading ? <span className="et-test-spinner" /> : "Load"}
            </button>
            <button
              className="et-test-btn"
              onClick={handleClear}
              disabled={!loadedCode}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                minWidth: "80px",
                justifyContent: "center",
              }}
            >
              Clear
            </button>
          </div>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "#94a3b8", paddingTop: "4px" }}
            >
              Examples:
            </span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.value}
                onClick={() => {
                  setQrCodeId(ex.value);
                }}
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  color: "#2957FF",
                  fontFamily: "monospace",
                  letterSpacing: "0.3px",
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              className="et-test-spinner"
              style={{
                width: "32px",
                height: "32px",
                borderWidth: "4px",
                borderTopColor: "#2957FF",
                borderColor: "#e2e8f0",
              }}
            />
            <p
              style={{ fontSize: "14px", color: "#64748b", marginTop: "12px" }}
            >
              Loading widget...
            </p>
          </div>
        )}

        <div
          id={containerId}
          style={{
            // background: "white",
            // borderRadius: "16px",
            // boxShadow:
            //   "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            overflow: "hidden",
            minHeight: loadedCode && !loading ? "auto" : "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!loadedCode && !loading && (
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Enter a QR Code ID above and click Load
            </p>
          )}
        </div>

        {loadedCode && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              className="et-test-btn"
              onClick={handleClear}
              style={{
                background: "#f1f5f9",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Test Another Code
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              textAlign: "center",
              margin: 0,
            }}
          >
            This is a testing page for internal use. The widget loads the
            verification experience from <strong>emboditrust.com</strong> via an
            iframe. No backend calls are made from this page.
          </p>
        </div>
      </div>
      <footer
        id="demo"
        className="bg-[#032434] text-white transition-colors dark:bg-[#2f2f2f]"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:px-8 md:py-12">
          <div>
            <div className="flex items-center gap-2 text-3xl font-black">
              <Image
                src="/logo.png"
                alt="EmbodiTrust"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full"
              />
              EmbodiTrust
            </div>
            <p className="mt-3 text-slate-200">
              Measure and grow your product authenticity visibility.
            </p>
          </div>

          <div className="flex items-end gap-4 text-sm text-slate-200">
            <Link href="#" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms & Conditions
            </Link>
            <Link href="#" className="hover:text-white">
              Cookie Policy
            </Link>
            <Link href="#" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
