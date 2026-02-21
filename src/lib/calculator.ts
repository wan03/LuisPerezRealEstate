export interface PITIInput {
    price: number;
    downPayment: number;
    interestRate: number; // Annual rate as decimal (e.g. 0.07 for 7%)
    years: number;
    taxRate: number; // e.g. 0.012 for 1.2%
    insuranceYearly: number;
    cddYearly?: number;
    isHomesteadExempt: boolean;
}

export interface PITIResult {
    principalInterest: number;
    propertyTax: number;
    insurance: number;
    cdd: number;
    totalMonthly: number;
    homesteadSavings: number;
}

export function calculatePITI(input: PITIInput): PITIResult {
    const {
        price,
        downPayment,
        interestRate,
        years,
        taxRate,
        insuranceYearly,
        cddYearly = 0,
        isHomesteadExempt,
    } = input;

    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 12;
    const numberOfPayments = years * 12;

    // Principal and Interest formula: P * (r(1+r)^n) / ((1+r)^n - 1)
    let principalInterest = 0;
    if (monthlyRate === 0) {
        principalInterest = loanAmount / numberOfPayments;
    } else {
        principalInterest =
            (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    // Taxes
    // Homestead Exemption in FL: Typically $50k off assessed value
    // We'll simplify and say $50k off the purchase price for tax calculation
    const homesteadExemptionAmount = 50000;
    const taxableValue = isHomesteadExempt
        ? Math.max(0, price - homesteadExemptionAmount)
        : price;

    const yearlyTax = taxableValue * taxRate;
    const monthlyTax = yearlyTax / 12;

    const homesteadSavingsYearly = isHomesteadExempt ? homesteadExemptionAmount * taxRate : 0;
    const homesteadSavingsMonthly = homesteadSavingsYearly / 12;

    // Insurance
    const monthlyInsurance = insuranceYearly / 12;

    // CDD
    const monthlyCDD = cddYearly / 12;

    const totalMonthly = principalInterest + monthlyTax + monthlyInsurance + monthlyCDD;

    return {
        principalInterest: Math.round(principalInterest * 100) / 100,
        propertyTax: Math.round(monthlyTax * 100) / 100,
        insurance: Math.round(monthlyInsurance * 100) / 100,
        cdd: Math.round(monthlyCDD * 100) / 100,
        totalMonthly: Math.round(totalMonthly * 100) / 100,
        homesteadSavings: Math.round(homesteadSavingsMonthly * 100) / 100,
    };
}
