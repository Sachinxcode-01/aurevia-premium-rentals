export interface IndianState {
  code: string;
  name: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
];

export const AUREVIA_COMPANY_GST_DETAILS = {
  legalName: "AUREVIA CINEMA RENTALS LLP",
  tradeName: "AUREVIA Premium Camera Rentals",
  gstin: "29AAHCA1234F1Z5",
  pan: "AAHCA1234F",
  stateName: "Karnataka",
  stateCode: "29",
  address: "Vault 4B, UB City Luxury Tower, Vittal Mallya Road, Bengaluru, Karnataka - 560001",
  email: "billing@aurevia.com",
  phone: "+91 96869 09048",
  sacCode: "997311",
  sacDescription: "Leasing or rental services of cinema equipment & optical gear without operator",
};

export interface GSTBreakdown {
  taxableValue: number;
  isInterState: boolean;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalInvoiceAmount: number;
  placeOfSupply: string;
  sellerStateCode: string;
  buyerStateCode: string;
}

export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  const clean = gstin.trim().toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(clean);
}

export function extractStateCodeFromGSTIN(gstin: string): string {
  if (!gstin || gstin.trim().length < 2) return "29";
  return gstin.trim().substring(0, 2);
}

export function calculateGSTBreakdown(
  taxableValue: number,
  buyerStateCodeOrGSTIN: string = "29"
): GSTBreakdown {
  const taxable = Math.max(0, taxableValue);
  let buyerCode = "29";

  if (buyerStateCodeOrGSTIN.length === 15) {
    buyerCode = extractStateCodeFromGSTIN(buyerStateCodeOrGSTIN);
  } else if (buyerStateCodeOrGSTIN.length === 2) {
    buyerCode = buyerStateCodeOrGSTIN;
  }

  const buyerState = INDIAN_STATES.find((s) => s.code === buyerCode) || {
    code: "29",
    name: "Karnataka",
  };

  // Seller is in Karnataka (Code 29)
  const isInterState = buyerCode !== AUREVIA_COMPANY_GST_DETAILS.stateCode;

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isInterState) {
    // Inter-State: 18% IGST
    igstRate = 18;
    igstAmount = Math.round(taxable * 0.18);
  } else {
    // Intra-State: 9% CGST + 9% SGST
    cgstRate = 9;
    cgstAmount = Math.round(taxable * 0.09);
    sgstRate = 9;
    sgstAmount = Math.round(taxable * 0.09);
  }

  const totalTaxAmount = isInterState ? igstAmount : cgstAmount + sgstAmount;
  const totalInvoiceAmount = taxable + totalTaxAmount;

  return {
    taxableValue: taxable,
    isInterState,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTaxAmount,
    totalInvoiceAmount,
    placeOfSupply: `${buyerState.code} - ${buyerState.name}`,
    sellerStateCode: AUREVIA_COMPANY_GST_DETAILS.stateCode,
    buyerStateCode: buyerCode,
  };
}

export function convertNumberToIndianWords(num: number): string {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return "Indian Rupees Zero Only";

  const numStr = ("000000000" + n).substr(-9);
  const match = numStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!match) return `Indian Rupees ${n} Only`;

  let str = "";
  // Crores
  str +=
    Number(match[1]) !== 0
      ? (a[Number(match[1])] || b[Number(match[1][0])] + " " + a[Number(match[1][1])]) + "Crore "
      : "";
  // Lakhs
  str +=
    Number(match[2]) !== 0
      ? (a[Number(match[2])] || b[Number(match[2][0])] + " " + a[Number(match[2][1])]) + "Lakh "
      : "";
  // Thousands
  str +=
    Number(match[3]) !== 0
      ? (a[Number(match[3])] || b[Number(match[3][0])] + " " + a[Number(match[3][1])]) + "Thousand "
      : "";
  // Hundreds
  str +=
    Number(match[4]) !== 0 ? a[Number(match[4])] + "Hundred " : "";
  // Tens and Units
  str +=
    Number(match[5]) !== 0
      ? (str !== "" ? "and " : "") +
        (a[Number(match[5])] || b[Number(match[5][0])] + " " + a[Number(match[5][1])])
      : "";

  return `Indian Rupees ${str.trim()} Only`;
}
