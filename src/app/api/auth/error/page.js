'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return 'You don\'t have access to this portal. Please make sure you\'re using your institutional email address.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
        
        <div className="mt-4 text-gray-600">
          <p>{getErrorMessage()}</p>
        </div>

        <div className="mt-6">
          <Link
            href="/api/auth/signin"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 