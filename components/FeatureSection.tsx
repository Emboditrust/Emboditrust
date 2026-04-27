import Image from 'next/image';

interface FeatureSectionProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reversed?: boolean;
  dark?: boolean;
}

export default function FeatureSection({
  title,
  description,
  image,
  imageAlt,
  reversed = false,
  dark = false,
}: FeatureSectionProps) {
  return (
    <section className={`py-20 md:py-28 ${dark ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className={reversed ? 'md:order-last' : ''}>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h2>
            <p className={`text-lg leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
              {description}
            </p>
          </div>

          <div className={`relative h-96 md:h-full min-h-96 overflow-hidden rounded-2xl ${reversed ? 'md:order-first' : ''}`}>
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              quality={85}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
