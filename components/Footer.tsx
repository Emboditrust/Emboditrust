export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
           
            <span className="text-lg font-bold">EmbodiTrust</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-900">
              &copy; {new Date().getFullYear()} EmbodiTrust. All rights reserved.
            </p>
            <p className="text-gray-800 text-sm mt-2">
              Secure Every Product. Empower Every Customer.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}