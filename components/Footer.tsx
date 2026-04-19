export default function Footer() {
  return (
    <footer className="bg-[#0f172a] py-14 text-slate-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-emerald-600" />
              <span className="text-lg font-semibold text-white">EmbodiTrust</span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-400">
              Product authentication, verification, and fraud intelligence for brands that need confidence at scale.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Platform</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#features">Verification</a></li>
              <li><a href="#products">Templates</a></li>
              <li><a href="#industries">Industries</a></li>
              <li><a href="#contact">Request Demo</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Use Cases</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Pharma</li>
              <li>FMCG</li>
              <li>Distribution</li>
              <li>Import Control</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Resources</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Field Guides</li>
              <li>Rollout Playbooks</li>
              <li>Verification FAQs</li>
              <li>Support</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Company</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>About</li>
              <li>Contact</li>
              <li>Admin Login</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} EmbodiTrust. All rights reserved.
        </div>
      </div>
    </footer>
  );
}