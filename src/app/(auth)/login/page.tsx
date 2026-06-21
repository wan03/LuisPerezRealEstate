'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Successfully logged in, now determine where to redirect based on profile
        console.log('Login successful, fetching profile for:', data.user.id);
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
        }

        console.log('Profile fetched:', profile);

        if (profile) {
            if (profile.role === 'admin') {
                console.log('Redirecting to /admin');
                router.push('/admin');
            }
            else if (profile.role === 'agent' || profile.role === 'loan_officer') {
                console.log('Redirecting to /portal');
                router.push('/portal');
            }
            else {
                console.log('Redirecting to /dashboard');
                router.push('/dashboard');
            }
        } else {
            console.log('No profile found, redirecting to /');
            router.push('/');
        }
    };

    const btnBase = 'inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px';

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            {/* Loading overlay */}
            {loading && (
                <div className="fixed inset-0 z-[100] bg-bg/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="lp-spinner w-10 h-10" />
                    <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-mut">Establishing connection...</p>
                </div>
            )}

            {/* Top nav */}
            <nav className="border-b border-line bg-bg/90 backdrop-blur-xl">
                <div className="h-16 px-5 md:px-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="lp-mark w-9 h-9 text-[12px]">LP</span>
                        <div>
                            <div className="font-black text-[14px] tracking-[-0.02em] uppercase leading-none">
                                Luis Perez<span className="text-blue2">/RE</span>
                            </div>
                            <div className="font-mono text-[10px] text-mut mt-[3px]">Command Center</div>
                        </div>
                    </Link>
                    <Link href="/" className="font-mono text-[11px] font-bold tracking-[0.06em] uppercase text-mut hover:text-ink transition-colors flex items-center gap-1.5">
                        <ChevronLeft size={14} /> Back to Site
                    </Link>
                </div>
            </nav>

            {/* Page */}
            <div className="flex-1 relative flex items-center justify-center px-5 py-12">
                <div className="grid-bg" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] pointer-events-none bg-[radial-gradient(circle,rgba(59,98,255,0.18),transparent_70%)]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] pointer-events-none bg-[radial-gradient(circle,rgba(196,242,74,0.08),transparent_70%)]" />

                <div className="relative z-[2] w-full max-w-[440px]">
                    {/* Head */}
                    <div className="text-center mb-8">
                        <span className="lp-mark w-14 h-14 text-[20px] !bg-lime !text-accentink mx-auto mb-4">LP</span>
                        <h1 className="text-[28px] font-black uppercase italic tracking-[-0.03em]">Command Center</h1>
                        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-mut mt-1.5">Secure Access Portal</p>
                    </div>

                    {/* Card */}
                    <div className="corner-brackets bg-panel border border-line p-8">
                        <form onSubmit={handleLogin}>
                            {error && (
                                <div className="bg-org/10 border border-org/30 px-3.5 py-3 flex items-center gap-2.5 mb-4">
                                    <AlertCircle size={16} className="text-org flex-none" />
                                    <span className="font-mono text-[11px] text-org">{error}</span>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mut2 pointer-events-none" />
                                    <input
                                        required
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="lp-input py-[13px] pl-10 pr-3 text-[14px]"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut">Password</label>
                                    <Link href="/forgot-password" className="font-mono text-[10px] font-bold tracking-[0.06em] text-blue2 hover:text-lime transition-colors">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mut2 pointer-events-none" />
                                    <input
                                        required
                                        type="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="lp-input py-[13px] pl-10 pr-3 text-[14px]"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className={`${btnBase} w-full bg-lime text-accentink hover:bg-lime2 disabled:opacity-50`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        <ShieldCheck size={16} />
                                        Establish Secure Connection
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="h-px bg-line my-[22px]" />

                        <div className="text-center">
                            <p className="font-mono text-[11px] text-mut2">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="text-blue2 font-bold hover:text-lime transition-colors">
                                    Apply for Access
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* SSL line */}
                    <div className="flex items-center justify-center gap-2 mt-6 opacity-30">
                        <div className="w-[5px] h-[5px] rounded-full bg-lime" />
                        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink">SSL Encrypted · Supabase Auth · Powered by Command Center™</span>
                        <div className="w-[5px] h-[5px] rounded-full bg-lime" />
                    </div>
                </div>
            </div>
        </div>
    );
}
