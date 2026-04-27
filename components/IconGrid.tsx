import { type LucideIcon } from 'lucide-react';

interface IconGridItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface IconGridProps {
  title?: string;
  items: IconGridItem[];
  dark?: boolean;
  subtitle?: string;
}

export default function IconGrid({ title, items, dark = false, subtitle }: IconGridProps) {
  return (
    <section className={`py-20 md:py-28 ${dark ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="container mx-auto px-6 md:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-xl max-w-2xl mx-auto ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`p-8 rounded-xl transition-all duration-300 hover:scale-105 ${
                  dark
                    ? 'bg-slate-800 hover:bg-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
