import Navbar from './Navbar';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-coconut-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <span className="font-bold text-lg text-gray-800">Sree Vaari Traders</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                Bringing the authentic purity of nature's finest coconuts directly to your doorstep. Sustainable, organic, and premium quality.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Shop</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/products" className="hover:text-coconut-green transition-colors">All Products</Link></li>
                <li><Link to="/products?category=raw" className="hover:text-coconut-green transition-colors">Fresh Coconuts</Link></li>
                <li><Link to="/products?category=oil" className="hover:text-coconut-green transition-colors">Coconut Oil</Link></li>
                <li><Link to="/products?category=coir" className="hover:text-coconut-green transition-colors">Coir Products</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Company</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/about" className="hover:text-coconut-green transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-coconut-green transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-coconut-green transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-coconut-green transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Newsletter</h3>
              <p className="text-gray-500 text-sm mb-4">Subscribe to get special offers and updates.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-coconut-green text-sm"
                />
                <button className="bg-coconut-green text-white px-4 py-2 rounded-r-lg hover:bg-coconut-dark transition-colors text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Sree Vaari Traders. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {/* Social icons placeholders */}
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
