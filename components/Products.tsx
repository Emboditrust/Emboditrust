import { QrCode, Map, Gift, Users, BarChart, MessageSquare } from 'lucide-react';
import { Product } from '@/types';

const products: Product[] = [
  {
    name: 'EmbodiTrust Secure™',
    description: 'End-to-end product authentication using secure QR labels and scratch codes. Real-time authenticity data.',
    icon: QrCode,
  },
  {
    name: 'EmbodiTrust Track™',
    description: 'Trace product movement using geo-tagged scan events. Detect diversion and unauthorized sales.',
    icon: Map,
  },
  {
    name: 'EmbodiTrust Engage™',
    description: 'Reward true customers through integrated loyalty system triggered after verification.',
    icon: Gift,
  },
  {
    name: 'EmbodiTrust Partner™',
    description: 'Performance-driven incentive platform for retailers and distributors based on verified sales data.',
    icon: Users,
  },
  {
    name: 'EmbodiTrust Insights™',
    description: 'Analytics command center with scan activity, heat maps, trends, and fraud alerts.',
    icon: BarChart,
  },
  {
    name: 'EmbodiTrust Pulse™',
    description: 'Collect verified customer feedback with AI sentiment analysis. Works online, offline, and with SMS.',
    icon: MessageSquare,
  },
];

export default function Products() {
  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Our Products</h2>
        <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
          A comprehensive suite of solutions for brand protection and customer engagement
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const IconComponent = product.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-emerald-50 to-indigo-50 rounded-xl p-8 shadow-lg card-hover border border-blue-100"
              >
                <div className="w-12 h-12 bg-emerald-800 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{product.name}</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}