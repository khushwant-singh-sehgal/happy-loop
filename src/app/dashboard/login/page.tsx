'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignupModal from '../../../components/auth/SignupModal';
import { useAuth } from '../../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Loading auth context...');
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();
  
  useEffect(() => {
    console.log('Login page mounted');
    console.log('Auth context state:', { user, isLoading });
    
    if (user) {
      setDebugInfo('User is authenticated, should redirect to dashboard');
    } else if (!isLoading) {
      setDebugInfo('Auth loaded, no user found');
    }
    
    // Add window error handler to catch rendering errors
    const handleError = (event: ErrorEvent) => {
      console.error('Window error:', event.error);
      setDebugInfo(`Error: ${event.error?.message || 'Unknown error'}`);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [user, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebugInfo('Attempting login...');

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setDebugInfo(`Login error: ${signInError.message}`);
      } else {
        setDebugInfo('Login successful, redirecting...');
        // Navigate to dashboard on successful login
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError('An error occurred during login');
      setDebugInfo(`Login exception: ${err instanceof Error ? err.message : String(err)}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openSignupModal = () => {
    setShowSignupModal(true);
  };

  const closeSignupModal = () => {
    setShowSignupModal(false);
  };

  // Debug screen if rendering appears to fail
  if (error.includes('rendering') || debugInfo.includes('Error')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Login Page Error</h1>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-red-800">{error || debugInfo}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-medium mb-2">Debug Info:</h2>
            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify({ 
              userExists: !!user, 
              isLoading, 
              pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
              timestamp: new Date().toISOString() 
            }, null, 2)}</pre>
          </div>
          <div className="mt-4 flex justify-between">
            <Link href="/" className="text-blue-600 hover:underline">Go to Home</Link>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 to-pink-500">
      {/* Debug info banner */}
      <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
        Debug: {debugInfo} | Auth loading: {isLoading ? 'Yes' : 'No'} | User: {user ? 'Logged in' : 'Not logged in'}
      </div>
      
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-2 text-white">
          <span className="text-xl font-bold">Happy Loop</span>
          <span className="text-xl">🎮</span>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard Login</h1>
            <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="parent@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account? 
              <button 
                onClick={openSignupModal}
                className="ml-1 text-purple-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Sign up now
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Signup Modal */}
      <SignupModal isOpen={showSignupModal} onClose={closeSignupModal} />
    </div>
  );
} 