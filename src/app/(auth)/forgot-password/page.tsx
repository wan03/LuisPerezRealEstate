'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-10 text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-500 rounded-full shadow-xl shadow-indigo-500/20 mb-4">
                        <CheckCircle2 className="text-white" size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Check Your Email</h2>
                    <p className="text-slate-400 font-medium leading-relaxed px-4">
                        We&apos;ve sent a password reset link to <span className="text-indigo-400">{email}</span>. Please click the link to choose a new password.
                    </p>
                    <Link href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest transition-all">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 mb-4 transform hover:rotate-12 transition-transform">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Reset Password</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Recover your Command Center access</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl">
                    <form onSubmit={handleReset} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-900/40 relative overflow-hidden group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    Send Reset Link
                                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs font-bold">
                            Remember your password?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest font-black text-[10px]">
                                Secure Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
