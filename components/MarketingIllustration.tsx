type IllustrationVariant = 'agents' | 'industries' | 'usecases' | 'resources' | 'company';

const illustrationMap: Record<IllustrationVariant, { src: string; alt: string; eyebrow: string; label: string }> = {
  agents: {
    src: '/illustrations/engineer.svg',
    alt: 'Illustration of a verification agent workflow',
    eyebrow: 'Autonomous Monitoring',
    label: 'Live agent flow',
  },
  industries: {
    src: '/illustrations/businessman-with-a-suitcase.svg',
    alt: 'Illustration representing industry operations and logistics',
    eyebrow: 'Sector Intelligence',
    label: 'Multi-industry readiness',
  },
  usecases: {
    src: '/illustrations/creative-work.svg',
    alt: 'Illustration of a team planning verification use cases',
    eyebrow: 'Workflow Design',
    label: 'Use-case mapping',
  },
  resources: {
    src: '/illustrations/photographer.svg',
    alt: 'Illustration representing documentation and resource creation',
    eyebrow: 'Operational Guides',
    label: 'Playbooks and kits',
  },
  company: {
    src: '/illustrations/shaking-hands.svg',
    alt: 'Illustration of partnership and company collaboration',
    eyebrow: 'Trust Infrastructure',
    label: 'Built for partnership',
  },
};

export default function MarketingIllustration({ variant }: { variant: IllustrationVariant }) {
  const illustration = illustrationMap[variant];

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#eef4fb_100%)] p-5 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(180deg,_#464646_0%,_#3a3a3a_100%)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-200">{illustration.eyebrow}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-100">{illustration.label}</p>
        </div>
        <span className="rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-[#4b4b4b] dark:text-cyan-200">
          EmbodiTrust
        </span>
      </div>
      <img
        src={illustration.src}
        alt={illustration.alt}
        className="h-auto w-full max-h-[20rem] object-contain drop-shadow-[0_22px_30px_rgba(3,36,52,0.18)] md:max-h-[22rem]"
      />
    </div>
  );
}
