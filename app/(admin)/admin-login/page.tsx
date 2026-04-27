"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Moon,
  Sun,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isDark = mounted && theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#e8ebf0] bg-texture text-[#0b1c2e] transition-colors duration-300 dark:bg-[#333333] dark:text-[#f3f4f6] [font-family:Urbanist,Outfit,Montserrat,ui-sans-serif]">
      <style>{`
        .bg-texture {
          background-image: radial-gradient(circle, rgba(71,85,105,0.2) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-texture {
          background-image: radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-5 pt-4 md:px-8 md:pt-5">
        <header className="rounded-xl border border-[#d7dde6] bg-white/95 shadow-md backdrop-blur transition-colors duration-300 dark:border-[#5a5a5a] dark:bg-[#3a3a3a]/95">
          <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-5">
            <Link href="/" className="flex items-center gap-2.5 text-base font-bold md:text-lg">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-400 text-[11px] font-black text-slate-900">E</span>
              <span>EmbodiTrust</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-[#666666] dark:bg-[#444444] dark:text-slate-100 dark:hover:bg-[#505050]"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              <Link href="/" className="rounded-md bg-[#042333] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a]">
                Back to Site
              </Link>
            </div>
          </div>
        </header>
      </div>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 pb-16 pt-12 md:grid-cols-2 md:px-8 md:pb-20 md:pt-16">
        <div>
         
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Sign in as Admin
            <br />
            Manage the Platform.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
            Monitor suspicious activity, manage code batches, and keep product trust signals healthy from one secure dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-[#cfd7e3] bg-white/95 p-6 shadow-md transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/95 md:p-8">
          <h2 className="text-2xl font-black md:text-3xl">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use your admin credentials to continue.</p>

          {error && (
            <Alert variant="destructive" className="mt-6 text-left">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="h-11 border-[#c8d1dd] bg-white/95 pl-10 dark:border-[#595959] dark:bg-[#2f2f2f]"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-11 border-[#c8d1dd] bg-white/95 pl-10 pr-10 dark:border-[#595959] dark:bg-[#2f2f2f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-300">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(value) => setRememberMe(Boolean(value))}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-medium text-cyan-700 hover:text-cyan-800 hover:underline dark:text-cyan-300 dark:hover:text-cyan-200">
                Forgot password
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-[#032434] text-sm font-semibold text-white transition-colors hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a]"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#d7dde6] bg-white/90 py-4 text-sm text-slate-600 dark:border-[#555555] dark:bg-[#3a3a3a]/95 dark:text-slate-300">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 md:flex-row md:px-8">
          <span>Copyright 2026 EmbodiTrust</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
