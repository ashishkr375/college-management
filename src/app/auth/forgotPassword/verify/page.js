"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage('');

        const response = await fetch('/api/auth/forget_password/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();
        setMessage(data.message);

        if (response.ok) {
            setTimeout(() => router.push(`/auth/forgotPassword/reset?email=${email}`), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-96 bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-center text-2xl font-bold">Verify OTP</h2>
                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                    <button className="w-full p-2 bg-green-600 text-white rounded-md">Verify OTP</button>
                </form>
                {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
            </div>
        </div>
    );
}
