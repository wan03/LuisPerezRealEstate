'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const supabase = createClient();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        if (updateError) {
            setError(updateError.message);
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
                    <div className="inline-flex items-center justify-center p-4 bg-emerald-500 rounded-full shadow-xl shadow-emerald-500/20 mb-4">
                        <CheckCircle2 className="text-white" size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Password Updated</h2>
                    <p className="text-slate-400 font-medium leading-relaxed px-4">
                        Your password has been successfully updated. You can now login to your Command Center with your new credentials.
                    </p>
                    <Link href="/login" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest transition-all">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20 mb-4 transform hover:rotate-12 transition-transform">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">New Password</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Secure your Command Center access</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/40 relative overflow-hidden group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
