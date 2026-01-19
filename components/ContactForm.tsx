'use client';

export default function ContactForm() {
  const handleJoinWaitlist = () => {
    // Redirect directly to Google Form
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSd3Rx0VAHmR8jNddlyjhSVQtosZnURwM2P2gnQDu1puYXH1KQ/viewform';
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Get Started — Let&apos;s Secure Your Products
          </h2>
          <p className="text-xl text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our waiting list and be among the first to experience EmbodiTrust
          </p>

          <div className="bg-gray-50 rounded-2xl p-12 shadow-xl border border-gray-200">
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Ready to Protect Your Brand?
              </h3>
              <p className="text-gray-600 mb-8">
                Join our exclusive waiting list and be notified when EmbodiTrust launches. 
                Get early access to our platform and special launch offers.
              </p>
            </div>

            <button
              onClick={handleJoinWaitlist}
              className="bg-emerald-800 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Join Waiting List
            </button>
            
            <p className="text-sm text-gray-500 mt-6">
              You&apos;ll be redirected to our Google Form to join the waiting list
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Secure Your Products</h4>
              <p className="text-gray-600 text-sm">Protect against counterfeits and fraud</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Build Customer Trust</h4>
              <p className="text-gray-600 text-sm">Instant verification and engagement</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Gain Valuable Insights</h4>
              <p className="text-gray-600 text-sm">Real-time analytics and data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}