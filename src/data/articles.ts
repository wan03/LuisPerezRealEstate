export interface Article {
    slug: string;
    title: string;
    category: string;
    content: string;
    description: string;
    readTime: string;
}

export const ARTICLES: Article[] = [
    {
        slug: 'cdd-guide',
        title: 'The Florida CDD Fee Guide',
        category: 'Financing',
        description: 'Learn how Community Development District fees affect your monthly mortgage and property taxes.',
        readTime: '6 min read',
        content: `
# Understanding CDD Fees in Central Florida

Community Development District (CDD) fees are a unique aspect of Florida real estate. When you buy in a newer community, you might see a "CDD Fee" on your tax bill.

## What is a CDD?
A CDD is a special-purpose government framework which provides a mechanism for the financing and management of major infrastructure in a community.

## How it Affects Your PITI
1. **Principal and Interest**: The CDD bond is paid over 20-30 years.
2. **Maintenance**: There is also an O&M (Operations & Maintenance) component.

In our PITI+ Calculator, we factor these in so you are never surprised by your monthly total.
    `
    },
    {
        slug: 'homestead-exemption',
        title: 'Homestead Exemption Hacks',
        category: 'Taxes',
        description: 'Save up to $750/year by properly filing for your Florida Homestead Exemption.',
        readTime: '4 min read',
        content: `
# Florida Homestead Exemption: Your Tax Secret Weapon

If you live in Florida and use your property as your primary residence, you qualify for the Homestead Exemption.

## The \$50,000 Benefit
The first \$25,000 of assessed value is exempt from all property taxes. An additional \$25,000 is exempt from non-school taxes.

## How to Apply
Applications must be filed with the County Property Appraiser by March 1st of the tax year.
    `
    },
    {
        slug: 'septic-101',
        title: 'Choosing the Right Septic Pro',
        category: 'Due Diligence',
        description: 'Buying vacant land? Here is what you need to know about septic inspections and permitting.',
        readTime: '8 min read',
        content: `
# Vacant Land: The Septic and Well Deep Dive

In Highlands County, many lots require private septic systems and wells.

## Septic Tank Inspection
Before closing on a lot, you MUST have a soil perk test. This determines if the land can drain properly.

## Costs to Budget
A new septic system in Florida can range from \$5,000 to \$15,000 depending on the type (mound vs gravity).
    `
    },
];
