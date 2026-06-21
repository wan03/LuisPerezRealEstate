'use client';

import React, { useState, useEffect } from 'react';
import { calculatePITI, PITIInput, PITIResult } from '@/lib/calculator';
import { useTranslation } from '@/lib/i18n';

export default function PITICalculator({ initialPrice = 345000 }: { initialPrice?: number }) {
    const [inputs, setInputs] = useState<PITIInput>({
        price: initialPrice,
        downPayment: Math.round(initialPrice * 0.2),
        interestRate: 0.066,
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

    const max = Math.max(results.principalInterest, results.propertyTax, results.insurance, results.cdd, 1);
    const w = (n: number) => `${(n / max) * 100}%`;

    return (
        <div className="piti relative overflow-hidden bg-bg2 border border-line">
            <div className="grid-bg" style={{ opacity: 0.2 }} />
            <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2">
                {/* LEFT — inputs */}
                <div className="p-7 md:p-12 border-b lg:border-b-0 lg:border-r border-line">
                    <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-2">03 / {t('tools.badge')}</div>
                    <h2 className="text-[clamp(26px,3vw,40px)] font-black uppercase tracking-[-0.03em] leading-[0.96] mb-3.5">
                        {t('tools.title')} <em className="not-italic text-lime">{t('tools.titleHighlight')}</em>
                    </h2>
                    <p className="text-mut text-[14.5px] max-w-[40ch] mb-6 leading-relaxed">{t('tools.description')}</p>

                    {/* Home price */}
                    <div className="mb-3.5">
                        <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut mb-1.5">{t('piti.homePrice')}</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mut font-mono text-[13px] pointer-events-none">$</span>
                            <input type="number" name="price" value={inputs.price} onChange={handleChange} className="lp-input pl-6 pr-3 py-[11px] text-[14px]" />
                        </div>
                    </div>

                    {/* Down + rate */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                        <div>
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut mb-1.5">{t('piti.downPayment')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mut font-mono text-[13px] pointer-events-none">$</span>
                                <input type="number" name="downPayment" value={inputs.downPayment} onChange={handleChange} className="lp-input pl-6 pr-3 py-[11px] text-[14px]" />
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut mb-1.5">{t('piti.interestRate')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mut font-mono text-[13px] pointer-events-none">%</span>
                                <input type="number" step="0.01" name="interestRate" value={+(inputs.interestRate * 100).toFixed(3)} onChange={(e) => setInputs(p => ({ ...p, interestRate: (parseFloat(e.target.value) || 0) / 100 }))} className="lp-input pl-[22px] pr-3 py-[11px] text-[14px]" />
                            </div>
                        </div>
                    </div>

                    {/* Tax + insurance + cdd */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div>
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut mb-1.5">{t('piti.annualTax')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mut font-mono text-[13px] pointer-events-none">%</span>
                                <input type="number" step="0.01" name="taxRate" value={+(inputs.taxRate * 100).toFixed(3)} onChange={(e) => setInputs(p => ({ ...p, taxRate: (parseFloat(e.target.value) || 0) / 100 }))} className="lp-input pl-[22px] pr-3 py-[11px] text-[14px]" />
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut mb-1.5">{t('piti.annualInsurance')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mut font-mono text-[13px] pointer-events-none">$</span>
                                <input type="number" name="insuranceYearly" value={inputs.insuranceYearly} onChange={handleChange} className="lp-input pl-6 pr-3 py-[11px] text-[14px]" />
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut mb-1.5">{t('piti.cddFee')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mut font-mono text-[13px] pointer-events-none">$</span>
                                <input type="number" name="cddYearly" value={inputs.cddYearly} onChange={handleChange} className="lp-input pl-6 pr-3 py-[11px] text-[14px]" />
                            </div>
                        </div>
                    </div>

                    {/* Homestead toggle */}
                    <label className="flex items-center gap-2.5 border border-line bg-panel px-3.5 py-[11px] cursor-pointer mt-2.5 hover:border-mut transition-colors">
                        <input type="checkbox" name="isHomesteadExempt" checked={inputs.isHomesteadExempt} onChange={handleChange} className="hidden peer" />
                        <span className="w-10 h-[22px] bg-elev relative transition-colors flex-none peer-checked:bg-lime after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-[18px] after:h-[18px] after:bg-white after:transition-transform peer-checked:after:translate-x-[18px] peer-checked:after:bg-accentink" />
                        <span className="font-mono text-[11px] font-bold uppercase">{t('piti.homestead')} · $50K</span>
                    </label>
                </div>

                {/* RIGHT — results */}
                <div className="p-7 md:p-12 flex flex-col justify-center" style={{ background: 'radial-gradient(circle at 85% 10%,rgba(59,98,255,.14),transparent 55%)' }}>
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mut">{t('piti.monthlyPayment')}</div>
                    <div className="text-[clamp(54px,8vw,100px)] font-black tracking-[-0.05em] leading-[0.9] mt-1.5 mb-1">
                        ${results.totalMonthly.toLocaleString()}<small className="text-[22px] text-mut font-semibold">{t('piti.perMonth')}</small>
                    </div>
                    <div className="font-mono text-[11px] text-lime mb-6">▾ {t('piti.homesteadBadge')} ${results.homesteadSavings.toLocaleString()}{t('piti.perMonth')}</div>

                    <div className="flex flex-col gap-3">
                        {/* P&I */}
                        <div>
                            <div className="flex justify-between font-mono text-[11.5px] mb-1">
                                <span className="text-mut flex gap-1.5 items-center"><i className="w-2 h-2 flex-none" style={{ background: 'var(--blue)' }} />{t('piti.principal')}</span>
                                <b className="text-ink">${results.principalInterest.toLocaleString()}</b>
                            </div>
                            <div className="lp-track"><i style={{ width: w(results.principalInterest), background: 'var(--blue)' }} /></div>
                        </div>
                        {/* Tax */}
                        <div>
                            <div className="flex justify-between font-mono text-[11.5px] mb-1">
                                <span className="text-mut flex gap-1.5 items-center"><i className="w-2 h-2 flex-none" style={{ background: 'var(--org)' }} />{t('piti.tax')}</span>
                                <b className="text-ink">${results.propertyTax.toLocaleString()}</b>
                            </div>
                            <div className="lp-track"><i style={{ width: w(results.propertyTax), background: 'var(--org)' }} /></div>
                        </div>
                        {/* Insurance */}
                        <div>
                            <div className="flex justify-between font-mono text-[11.5px] mb-1">
                                <span className="text-mut flex gap-1.5 items-center"><i className="w-2 h-2 flex-none" style={{ background: 'var(--lime)' }} />{t('piti.insurance')}</span>
                                <b className="text-ink">${results.insurance.toLocaleString()}</b>
                            </div>
                            <div className="lp-track"><i style={{ width: w(results.insurance), background: 'var(--lime)' }} /></div>
                        </div>
                        {/* CDD (conditional) */}
                        {results.cdd > 0 && (
                            <div>
                                <div className="flex justify-between font-mono text-[11.5px] mb-1">
                                    <span className="text-mut flex gap-1.5 items-center"><i className="w-2 h-2 flex-none" style={{ background: 'var(--mut)' }} />{t('piti.cdd')}</span>
                                    <b className="text-ink">${results.cdd.toLocaleString()}</b>
                                </div>
                                <div className="lp-track"><i style={{ width: w(results.cdd), background: 'var(--mut)' }} /></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
