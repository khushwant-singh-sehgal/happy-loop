'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onSignupClick?: () => void;
}

export default function Navbar({ onSignupClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSignupClick) {
      onSignupClick();
    } else {
      // Fallback to redirect if no click handler provided
      window.location.href = '/dashboard/signup';
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-purple-600">Happy Loop</span>
              <span className="text-2xl">🎮</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#how-it-works" className="text-gray-600 hover:text-purple-600">How It Works</Link>
            <Link href="/#features" className="text-gray-600 hover:text-purple-600">Features</Link>
            <Link href="/dashboard/login" className="text-gray-600 hover:text-purple-600">Login</Link>
            <a
              href="#"
              onClick={handleSignupClick}
              className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              Sign Up
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-purple-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden container-custom mx-auto px-4 pt-2 pb-4">
          <div className="space-y-3">
            <Link 
              href="/#how-it-works" 
              className="block text-gray-600 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#features" 
              className="block text-gray-600 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/dashboard/login" 
              className="block text-gray-600 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <a
              href="#" 
              onClick={(e) => {
                handleSignupClick(e);
                setMobileMenuOpen(false);
              }}
              className="block bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors w-full text-center"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </header>
  );
} 