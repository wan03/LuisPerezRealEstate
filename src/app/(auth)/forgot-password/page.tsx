'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    const btnBase = 'inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px';

    const TopNav = () => (
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
    );

    if (success) {
        return (
            <div className="min-h-screen bg-bg flex flex-col">
                <TopNav />
                <div className="flex-1 relative flex items-center justify-center px-5 py-12">
                    <div className="grid-bg" />
                    <div className="relative z-[2] w-full max-w-[440px]">
                        <div className="corner-brackets bg-panel border border-line p-8 text-center">
                            <span className="lp-mark w-14 h-14 !bg-lime !text-bg mx-auto mb-5 inline-grid">
                                <CheckCircle2 size={28} />
                            </span>
                            <h2 className="text-[28px] font-black uppercase italic tracking-[-0.03em]">Check Your Email</h2>
                            <p className="text-mut leading-relaxed mt-4 mb-6">
                                We&apos;ve sent a password reset link to <span className="text-blue2">{email}</span>. Please click the link to choose a new password.
                            </p>
                            <Link href="/login" className={`${btnBase} w-full bg-lime text-bg hover:bg-[#d2ff56]`}>
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            <TopNav />
            <div className="flex-1 relative flex items-center justify-center px-5 py-12">
                <div className="grid-bg" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] pointer-events-none bg-[radial-gradient(circle,rgba(59,98,255,0.18),transparent_70%)]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] pointer-events-none bg-[radial-gradient(circle,rgba(196,242,74,0.08),transparent_70%)]" />

                <div className="relative z-[2] w-full max-w-[440px]">
                    <div className="text-center mb-8">
                        <span className="lp-mark w-14 h-14 text-[20px] !bg-lime !text-bg mx-auto mb-4">LP</span>
                        <h1 className="text-[28px] font-black uppercase italic tracking-[-0.03em]">Reset <span className="text-lime">Password</span></h1>
                        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-mut mt-1.5">Recover your Command Center access</p>
                    </div>

                    <div className="corner-brackets bg-panel border border-line p-8">
                        <form onSubmit={handleReset}>
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="lp-input py-[13px] pl-10 pr-3 text-[14px]"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className={`${btnBase} w-full bg-lime text-bg hover:bg-[#d2ff56] disabled:opacity-50`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="h-px bg-line my-[22px]" />

                        <div className="text-center">
                            <p className="font-mono text-[11px] text-mut2">
                                Remember your password?{' '}
                                <Link href="/login" className="text-blue2 font-bold hover:text-lime transition-colors">
                                    Secure Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
