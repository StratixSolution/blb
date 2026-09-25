const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
}

function threeDigits(n: number): string {
  if (n >= 100) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
  return twoDigits(n);
}

export function amountInWords(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  const parts: string[] = [];
  let remaining = rupees;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  if (crore) parts.push(threeDigits(crore) + " Crore");

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");

  if (remaining) parts.push(threeDigits(remaining));

  let result = "Indian Rupee " + parts.join(" ");
  if (paise) result += ` and ${twoDigits(paise)} Paise`;
  result += " Only";
  return result;
}
