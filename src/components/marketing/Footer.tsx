import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-600 flex items-center">
              Happy Loop <span className="ml-2 text-xl">🎮</span>
            </h3>
            <p className="text-gray-600">
              Turn daily routines into joyful adventures with AI and rewards!
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#how-it-works" className="text-gray-600 hover:text-purple-600">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-gray-600 hover:text-purple-600">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#tech" className="text-gray-600 hover:text-purple-600">
                  Technology
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-purple-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Join Now</h4>
            <p className="text-gray-600 mb-4">Start your Happy Loop journey today!</p>
            <Link href="/dashboard" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Happy Loop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 