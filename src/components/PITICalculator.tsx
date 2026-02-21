'use client';

import React, { useState, useEffect } from 'react';
import { calculatePITI, PITIInput, PITIResult } from '@/lib/calculator';
import { Info, Calculator, Percent, DollarSign, Landmark } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function PITICalculator({ initialPrice = 450000 }: { initialPrice?: number }) {
    const [inputs, setInputs] = useState<PITIInput>({
        price: initialPrice,
        downPayment: initialPrice * 0.2,
        interestRate: 0.07,
        years: 30,
        taxRate: 0.012,
        insuranceYearly: 2400,
        cddYearly: 0,
        isHomesteadExempt: true,
    });

    const [results, setResults] = useState<PITIResult | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        setResults(calculatePITI(inputs));
    }, [inputs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setInputs((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
        }));
    };

    if (!results) return null;

    return (
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 p-3 rounded-2xl">
                    <Calculator className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('piti.title')}</h2>
                    <p className="text-slate-500 text-sm font-medium">Florida-Specific Monthly Estimate</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Inputs */}
                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-600 transition-colors">
                            {t('piti.homePrice')}
                        </label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="number"
                                name="price"
                                value={inputs.price}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-10 pr-4 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('piti.downPayment')}</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    name="downPayment"
                                    value={inputs.downPayment}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-10 pr-4 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('piti.interestRate')} (%)</label>
                            <div className="relative">
                                <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    name="interestRate"
                                    step="0.001"
                                    value={inputs.interestRate * 100}
                                    onChange={(e) => setInputs(p => ({ ...p, interestRate: parseFloat(e.target.value) / 100 }))}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-10 pr-4 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('piti.annualTax')} (%)</label>
                            <input
                                type="number"
                                name="taxRate"
                                step="0.001"
                                value={inputs.taxRate * 100}
                                onChange={(e) => setInputs(p => ({ ...p, taxRate: parseFloat(e.target.value) / 100 }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CDD ({t('piti.perMonth').replace('/', '')})</label>
                            <input
                                type="number"
                                name="cddYearly"
                                value={inputs.cddYearly}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group bg-indigo-50 p-4 rounded-2xl border border-indigo-100 transition-all hover:bg-indigo-100">
                        <div className="relative">
                            <input
                                type="checkbox"
                                name="isHomesteadExempt"
                                checked={inputs.isHomesteadExempt}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-sm font-bold text-indigo-900 select-none">{t('piti.homestead')} ($50k)</span>
                        <Info size={14} className="text-indigo-400 ml-auto" />
                    </label>
                </div>

                {/* Right Col: Results */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <Landmark size={120} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">{t('piti.monthlyPayment')}</h3>
                        <div className="text-5xl font-black mb-8">${results.totalMonthly.toLocaleString()}</div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> {t('piti.principal')}</span>
                                <span className="font-bold">${results.principalInterest.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> {t('piti.tax')}</span>
                                <span className="font-bold">${results.propertyTax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> {t('piti.insurance')}</span>
                                <span className="font-bold">${results.insurance.toLocaleString()}</span>
                            </div>
                            {results.cdd > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> {t('piti.cdd')}</span>
                                    <span className="font-bold">${results.cdd.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 relative z-10">
                        <div className="bg-indigo-500/20 rounded-xl p-3 flex items-center justify-between border border-indigo-500/20">
                            <span className="text-xs font-bold text-indigo-300">{t('piti.homesteadBadge')}</span>
                            <span className="text-sm font-black text-indigo-400">-${results.homesteadSavings}{t('piti.perMonth')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
