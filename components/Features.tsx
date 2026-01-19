import { Shield, MapPin, Target, Link, BarChart3, Activity } from 'lucide-react';
import { Feature } from '@/types';

const features: Feature[] = [
  {
    title: 'Brand Protection & Anti-Counterfeiting',
    description: 'Secure every product with tamper-proof QR and scratch codes. No app required — just trust, instantly.',
    icon: Shield,
  },
  {
    title: 'Product Traceability & Fraud Detection',
    description: 'Track product movement, detect diversion or suspicious activity across the supply chain.',
    icon: MapPin,
  },
  {
    title: 'Consumer Engagement & Loyalty',
    description: 'Reward real customers with loyalty points, cashback, or promo codes after verification.',
    icon: Target,
  },
  {
    title: 'Direct Brand-Consumer Connection',
    description: 'Engage customers through rewards, feedback, notifications, and surveys triggered by verified scans.',
    icon: Link,
  },
  {
    title: 'Verified Feedback & Intelligence',
    description: 'Collect feedback from real buyers with AI sentiment analysis for informed decisions.',
    icon: BarChart3,
  },
  {
    title: 'Real-Time Analytics & Insights',
    description: 'Dashboard with real-time verification analytics, location data, and counterfeit alerts.',
    icon: Activity,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">What We Do</h2>
        <p className="text-xl text-center font-headerAlt text-gray-600 mb-16 max-w-3xl mx-auto">
          Comprehensive solutions to protect your brand and build customer trust
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-emerald-900" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 font-heade leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}