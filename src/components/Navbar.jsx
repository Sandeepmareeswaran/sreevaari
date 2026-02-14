import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Search } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-coconut-green rounded-full flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-coconut-green uppercase">Sree Vaari</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Traders</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-coconut-green font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-coconut-green font-medium transition-colors">Products</Link>
            <Link to="/about" className="text-gray-600 hover:text-coconut-green font-medium transition-colors">About Us</Link>
            <Link to="/contact" className="text-gray-600 hover:text-coconut-green font-medium transition-colors">Contact</Link>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-400 hover:text-coconut-green transition-colors">
              <Search size={20} />
            </button>
            <Link to="/cart" className="text-gray-400 hover:text-coconut-green transition-colors relative">
              <ShoppingCart size={20} />
              {/* Cart Badge */}
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-coconut-green rounded-full">0</span>
            </Link>
            <Link to="/login" className="text-gray-400 hover:text-coconut-green transition-colors">
              <User size={20} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-coconut-green hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-gray-600 hover:text-coconut-green hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-coconut-green hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Products</Link>
            <Link to="/about" className="text-gray-600 hover:text-coconut-green hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link to="/cart" className="text-gray-600 hover:text-coconut-green hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Cart (0)</Link>
            <Link to="/login" className="text-gray-600 hover:text-coconut-green hover:bg-green-50 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Login</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
