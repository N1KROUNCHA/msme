/**
 * MsmeGrowth Tax Engine
 * Optimized for Indian GST/Tax Compliance
 */

const GST_SLABS = {
    'Dairy': 5,
    'Snacks': 12,
    'Electronics': 18,
    'Services': 18,
    'Luxury': 28,
    'General': 18,
    'Inventory': 18, // Default for stock
    'Rent': 18,
    'Salary': 0, // No GST on salary
    'Utilities': 12
};

/**
 * Calculate GST breakdown for a given amount and category
 * @param {number} totalAmount - Total amount including GST
 * @param {string} category - Business category
 * @param {boolean} isInterstate - True if outside home state (IGST)
 */
function calculateGST(totalAmount, category = 'General', isInterstate = false) {
    const rate = GST_SLABS[category] || 18;

    if (rate === 0) {
        return {
            taxableValue: totalAmount,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
            rate
        };
    }

    // Amount = TaxableValue + (TaxableValue * rate / 100)
    // Amount = TaxableValue * (1 + rate/100)
    const taxableValue = totalAmount / (1 + (rate / 100));
    const totalTax = totalAmount - taxableValue;

    if (isInterstate) {
        return {
            taxableValue,
            cgst: 0,
            sgst: 0,
            igst: totalTax,
            totalTax,
            rate
        };
    } else {
        const halfTax = totalTax / 2;
        return {
            taxableValue,
            cgst: halfTax,
            sgst: halfTax,
            igst: 0,
            totalTax,
            rate
        };
    }
}

module.exports = {
    calculateGST,
    GST_SLABS
};
