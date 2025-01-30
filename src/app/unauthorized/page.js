import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600">Unauthorized Access</h2>
        
        <div className="mt-4 text-gray-600">
          <p>
            You don't have permission to access this page. 
            Please contact your administrator if you think this is a mistake.
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 