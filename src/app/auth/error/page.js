'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        
        <div className="mt-4 text-gray-600">
          {error === 'AccessDenied' ? (
            <p>
              Sorry, you don't have access to this portal. Please make sure you're using
              your institutional email address and that you're registered in the system.
            </p>
          ) : (
            <p>An error occurred during authentication. Please try again.</p>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/auth/signin"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 