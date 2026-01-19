import React from 'react';
import { CheckCircle, Gift, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div id="about" className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">EmbodiTrust</h1>
          <nav className="flex gap-4">
            <button className="px-4 py-2 bg-blue-900 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition">
              How it works
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition">
              How Verification Works
            </button>
          </nav>
        </div>
      </header> */}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">
            Ensuring authenticity. Empowering consumers.
          </h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            <span className="font-semibold">EmbodiTrust</span> provides secure product authentication using encrypted QR codes and scratch-codes. We help consumers verify product authenticity instantly
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-12">
          <img
            src="/abt.jpg"
            alt="Happy consumer in store"
            className="w-full h-[500px] object-cover"
          />
        </div>

        {/* Description */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            <span className="font-semibold text-emerald-600">Emboditrust</span> helps consumers verify genuine products through QR codes or scratch codes, directly from their mobile devices. We offer actionable insights, consumer rewards, and end-to-end product authentication infrastructure. Our mission is simple: protect consumers, strengthen brands, and eliminate counterfeits at the root.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-8 mb-16">
          <p className="text-xl md:text-2xl text-center text-emerald-900 font-medium leading-relaxed">
            Our mission is to create a safer marketplace where every product is genuine, every customer feels secure, and every brand has the data it needs to thrive.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="mb-16">
          
          
          

          {/* How We Operate */}
          {/* <h3 className="text-3xl font-bold text-center text-blue-900 mb-12">How we operate</h3> */}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Verify Authenticity */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-emerald-800 mb-4">Verify Authenticity</h4>
              <p className="text-gray-700">
                Instant verification of product authenticity through secure codes
              </p>
            </div>

            {/* Earn Rewards */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-emerald-800 mb-4">Earn Rewards</h4>
              <p className="text-gray-700">
                Get rewarded for purchasing and verifying genuine products
              </p>
            </div>

            {/* Track Products */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-emerald-800 mb-4">Track Products</h4>
              <p className="text-gray-700">
                Full transparency with product tracking and location verification
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
       
      </section>

      

      {/* Floating About Button */}
      <button className="fixed bottom-8 right-8 px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-400 transition font-medium">
        About Us
      </button>
    </div>
  );
};

export default About;