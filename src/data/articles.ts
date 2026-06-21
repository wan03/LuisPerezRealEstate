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
<h2>Understanding CDD Fees in Central Florida</h2>
<p>Community Development District (CDD) fees are a unique aspect of Florida real estate. When you buy in a newer community, you might see a "CDD Fee" on your tax bill.</p>
<h3>What is a CDD?</h3>
<p>A CDD is a special-purpose government framework which provides a mechanism for the financing and management of major infrastructure in a community.</p>
<h3>How it Affects Your PITI</h3>
<ol>
    <li><strong>Principal and Interest</strong>: The CDD bond is paid over 20-30 years.</li>
    <li><strong>Maintenance</strong>: There is also an O&M (Operations &amp; Maintenance) component.</li>
</ol>
<p>In our PITI+ Calculator, we factor these in so you are never surprised by your monthly total.</p>
        `
    },
    {
        slug: 'homestead-exemption',
        title: 'Homestead Exemption Hacks',
        category: 'Taxes',
        description: 'Save up to $750/year by properly filing for your Florida Homestead Exemption.',
        readTime: '4 min read',
        content: `
<h2>Florida Homestead Exemption: Your Tax Secret Weapon</h2>
<p>If you live in Florida and use your property as your primary residence, you qualify for the Homestead Exemption.</p>
<h3>The $50,000 Benefit</h3>
<p>The first $25,000 of assessed value is exempt from all property taxes. An additional $25,000 is exempt from non-school taxes.</p>
<h3>How to Apply</h3>
<p>Applications must be filed with the County Property Appraiser by <strong>March 1st</strong> of the tax year. Don't leave money on the table!</p>
        `
    },
    {
        slug: 'septic-101',
        title: 'Choosing the Right Septic Pro',
        category: 'Due Diligence',
        description: 'Buying vacant land? Here is what you need to know about septic inspections and permitting.',
        readTime: '8 min read',
        content: `
<h2>Vacant Land: The Septic and Well Deep Dive</h2>
<p>In Polk County, many lots require private septic systems and wells.</p>
<h3>Septic Tank Inspection</h3>
<p>Before closing on a lot, you MUST have a soil perk test. This determines if the land can drain properly.</p>
<h3>Costs to Budget</h3>
<p>A new septic system in Florida can range from $5,000 to $15,000 depending on the type (mound vs gravity).</p>
        `
    },
];
