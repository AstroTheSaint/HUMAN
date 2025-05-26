'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-md border p-2 focus:border-yellow-400 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="w-full rounded-md border p-2 focus:border-yellow-400 focus:outline-none"
          />
          <button 
            onClick={handleLogin} 
            className="w-full rounded-md bg-yellow-400 px-4 py-2 text-white hover:bg-yellow-500 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
} 