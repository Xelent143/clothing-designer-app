import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

export const Login: React.FC = () => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const { signIn, signUp, user } = useAuth();

    if (user) {
        return <Navigate to="/app" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signup' && (!fullName || !mobile || !password)) {
                throw new Error("Please fill in all fields.");
            }
            if (!password) {
                throw new Error("Please enter your password.");
            }

            if (mode === 'signup') {
                const { error } = await signUp(email, password, { full_name: fullName, mobile_number: mobile });
                if (error) throw error;
                setMessage({ text: 'Account created! Please check your email to verify.', type: 'success' });
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                // No need to set success message for login, usually redirect or auth state change handles it
            }

        } catch (error: any) {
            setMessage({ text: error.message || 'Error authentication', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
            <div className="w-full max-w-md bg-neutral-900/50 border border-white/10 p-8 backdrop-blur-xl rounded-2xl animate-fade-in shadow-2xl">
                <div className="text-center mb-8">
                    <img src="/images/logo-brand.png" alt="Ayzelify" className="h-20 mx-auto mb-6" />
                    <p className="text-gray-400 text-sm uppercase tracking-widest text-[#a1a1aa] mb-4">Designer Access Portal</p>

                    <div className="flex bg-black/50 p-1 rounded-full border border-white/10 w-fit mx-auto">
                        <button
                            onClick={() => { setMode('signin'); setMessage(null); }}
                            className={`px-6 py-2 text-xs font-bold uppercase rounded-full transition-all ${mode === 'signin' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setMode('signup'); setMessage(null); }}
                            className={`px-6 py-2 text-xs font-bold uppercase rounded-full transition-all ${mode === 'signup' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {mode === 'signup' && (
                        <>
                            <div className="animate-fade-in">
                                <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-all rounded-lg"
                                    placeholder="YOUR FULL NAME"
                                />
                            </div>
                            <div className="animate-fade-in">
                                <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 p-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-all rounded-lg"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 p-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-all rounded-lg"
                            placeholder="YOUR EMAIL"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 p-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-all rounded-lg"
                            placeholder="YOUR PASSWORD"
                            minLength={6}
                        />
                    </div>

                    {message && (
                        <div className={`p-4 text-sm font-bold border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} rounded-lg text-center uppercase tracking-wide`}>
                            {message.text}
                        </div>
                    )}

                    <Button fullWidth disabled={loading} className="py-4 text-sm font-bold tracking-widest">
                        {loading ? 'PROCESSING...' : (mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT')}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">Secure Access • Powered by Supabase</p>
                </div>
            </div>
        </div>
    );
};
