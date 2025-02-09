'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { title } from 'process';
import { getSession } from 'next-auth/react';
export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@nitp\.ac\.in$/;
    return regex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateEmail(email)) {
      toast.error("Only nitp email's are allowed!", {
        position: "top-right",
        autoClose: 5000,
      });
      window.confirm("Only nitp email's are allowed")
      setIsLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result.error) {
      setError(result.error);
    } 
     else {
          const session = await getSession();
          console.log("Session:", session);
      
          if (session?.user?.role === "super_admin") {
            router.push("/admin/super-admin/dashboard");
          } else if (session?.user?.role === "faculty") {
            router.push("/faculty/dashboard");
          } else if (session?.user?.role === "student") {
            router.push("/student/dashboard");
          }
        }
    setIsLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Student Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">Sign in with your credentials</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/forgotPassword" className="text-indigo-600 hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
}