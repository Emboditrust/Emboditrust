import { Factory, Gem, Pill, Sprout, HeartHandshake, Building, ShoppingCart, GraduationCap } from 'lucide-react';
import { Industry } from '@/types';

const industries: Industry[] = [
  {
    name: 'Manufacturing & FMCG',
    description: 'Consumer goods, packaged items, electronics, household supplies.',
    icon: Factory,
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Cosmetics, skincare, haircare, wellness products.',
    icon: Gem,
  },
  {
    name: 'Pharmaceuticals & Healthcare',
    description: 'Drugs, supplements, medical supplies, health products.',
    icon: Pill,
  },
  {
    name: 'Agriculture & Food Products',
    description: 'Fertilizers, seeds, packaged foods, consumables.',
    icon: Sprout,
  },
  {
    name: 'NGOs & Donor Organizations',
    description: 'Aid distribution, field feedback, transparency and impact monitoring.',
    icon: HeartHandshake,
  },
  {
    name: 'Government & Regulatory Agencies',
    description: 'Compliance monitoring, anti-counterfeiting enforcement, public protection.',
    icon: Building,
  },
  {
    name: 'Retail & Distribution Networks',
    description: 'Wholesalers, retailers, and supply chain partners requiring verification.',
    icon: ShoppingCart,
  },
  {
    name: 'Academic & Research Institutions',
    description: 'Data collection, sentiment analytics, verification-linked studies.',
    icon: GraduationCap,
  },
];

export default function Industries() {
  return (
    <section id="industries" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Industries We Serve</h2>
        <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
          Built for organizations that rely on authenticity, trust, and transparent distribution
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => {
            const IconComponent = industry.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <IconComponent className="w-5 h-5 text-emerald-800" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{industry.name}</h3>
                <p className="text-sm text-gray-600">{industry.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}