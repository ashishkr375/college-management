"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@nitp\.ac\.in$/;
        return regex.test(email);
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!validateEmail(email)) {
              window.confirm("Only nitp email's are allowed")
              return;
            }

        const response = await fetch('/api/auth/forget_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setMessage(data.message);
        if(data.error){
            window.confirm(data.error)
        }
        
        if (response.ok) {
            setTimeout(() => router.push(`/auth/forgotPassword/verify?email=${email}`), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-96 bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-center text-2xl font-bold">Forgot Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                    <button className="w-full p-2 bg-blue-600 text-white rounded-md">Send OTP</button>
                </form>
                {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
            </div>
        </div>
    );
}
