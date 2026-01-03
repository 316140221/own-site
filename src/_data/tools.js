function normalizePath(path) {
  const raw = String(path || "").trim();
  if (!raw) return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const rawGroups = [
  {
    id: "dev",
    label: "Development",
    items: [
      {
        slug: "json",
        label: "JSON Format/Minify",
        description: "Pretty-print, minify, optional stable key sorting.",
      },
      {
        slug: "xml",
        label: "XML Format/Minify",
        description: "Pretty-print or minify XML locally in your browser.",
      },
      {
        slug: "csv",
        label: "CSV ↔ JSON",
        description: "Convert between CSV and JSON (headers, delimiter options).",
      },
      {
        slug: "diff",
        label: "Text/JSON Diff",
        description: "Compare two texts (or JSON) and generate a unified diff locally.",
      },
      {
        slug: "regex",
        label: "Regex Tester",
        description: "Test matches or do replacements with JavaScript RegExp.",
      },
      {
        slug: "jwt",
        label: "JWT Decode",
        description: "Decode JWT header and payload locally (no verification).",
      },
      {
        slug: "querystring",
        label: "Query String Parse/Build",
        description: "Parse a URL/querystring into JSON, or build a querystring from JSON.",
      },
      {
        slug: "hash",
        label: "SHA Hash",
        description: "WebCrypto: SHA-256 / SHA-1 / SHA-384 / SHA-512.",
      },
      {
        slug: "file-hash",
        label: "File Hash",
        description: "Compute file hashes locally (SHA + CRC32).",
      },
      {
        slug: "crc32",
        label: "CRC32 Checksum",
        description: "CRC32 checksum for UTF-8 text (hex + decimal).",
      },
      {
        slug: "md5",
        label: "MD5 Hash",
        description: "MD5 hash for UTF-8 text (hex or base64).",
      },
      {
        slug: "md4",
        label: "MD4 Hash",
        description: "MD4 hash for UTF-8 text (hex or base64).",
      },
      {
        slug: "md2",
        label: "MD2 Hash",
        description: "MD2 hash for UTF-8 text (hex or base64).",
      },
      {
        slug: "hmac",
        label: "HMAC",
        description: "WebCrypto HMAC with SHA-256 / SHA-1 / SHA-384 / SHA-512.",
      },
      {
        slug: "aes",
        label: "AES-GCM Encrypt/Decrypt",
        description: "AES-GCM + PBKDF2 (passphrase) in your browser.",
      },
      {
        slug: "rsa",
        label: "RSA Hybrid Encrypt/Decrypt",
        description: "Hybrid RSA-OAEP + AES-GCM for practical encrypt/decrypt.",
      },
    ],
  },
  {
    id: "encoding",
    label: "Encoding & Conversion",
    items: [
      {
        slug: "base64",
        label: "Base64 Encode/Decode",
        description: "UTF-8 text, URL-safe variant, optional padding removal.",
      },
      {
        slug: "base32",
        label: "Base32 Encode/Decode",
        description: "RFC 4648 Base32 for UTF-8 text, optional padding removal.",
      },
      {
        slug: "hex",
        label: "Hex Encode/Decode",
        description: "UTF-8 text ↔ HEX bytes (with optional separators).",
      },
      {
        slug: "url",
        label: "URL Encode/Decode",
        description: "encodeURIComponent / decodeURIComponent helpers.",
      },
      {
        slug: "unicode",
        label: "Unicode Escape/Unescape",
        description: "Escape and unescape \\uXXXX / \\u{...} / \\xNN sequences.",
      },
      {
        slug: "html",
        label: "HTML Escape/Unescape",
        description: "Escape/unescape HTML entities like &lt; &gt; &amp; &quot; &#39;.",
      },
      {
        slug: "base58",
        label: "Base58 Encode/Decode",
        description: "Bitcoin alphabet Base58 for UTF-8 text.",
      },
      {
        slug: "base85",
        label: "Base85 (Ascii85) Encode/Decode",
        description: "Ascii85/Base85 for UTF-8 text, optional “z” compression.",
      },
      {
        slug: "escape",
        label: "Escape/Unescape (JS)",
        description: "Legacy JavaScript escape()/unescape() encoder/decoder.",
      },
    ],
  },
  {
    id: "image",
    label: "Image",
    items: [
      {
        slug: "image-compress",
        label: "Image Compress/Resize",
        description: "Compress, resize, and convert images locally in your browser.",
      },
      {
        slug: "image-base64",
        label: "Image → Base64",
        description: "Convert images to Data URL / Base64 / HTML / Markdown locally.",
      },
      {
        slug: "image-watermark",
        label: "Image Watermark",
        description: "Add a text watermark to images locally in your browser.",
      },
      {
        slug: "image-crop",
        label: "Image Crop/Round",
        description: "Center-crop images (aspect ratios) and export with rounded corners locally.",
      },
      {
        slug: "color",
        label: "Color Converter",
        description: "Convert between HEX/RGB/HSL color formats.",
      },
    ],
  },
  {
    id: "efficiency",
    label: "Efficiency",
    items: [
      {
        slug: "utm",
        label: "UTM Link Builder",
        description: "Generate tracking links with UTM parameters locally.",
      },
      {
        slug: "amazon-link",
        label: "Amazon Affiliate Link Builder",
        description: "Generate Amazon /go links and affiliate URLs locally.",
      },
      {
        slug: "qr-code",
        label: "QR Code Generator",
        description: "Generate QR codes locally (PNG/SVG) with colors and error correction.",
      },
      {
        slug: "qr-scan",
        label: "QR Code Scanner",
        description: "Scan QR codes from an image or camera locally in your browser.",
      },
      {
        slug: "password",
        label: "Password Generator",
        description: "Generate strong random passwords locally.",
      },
      {
        slug: "uuid",
        label: "UUID Generator",
        description: "Generate UUID v4 locally in your browser.",
      },
      {
        slug: "uuid-v7",
        label: "UUID v7 Generator",
        description: "Generate time-ordered UUID v7 locally in your browser.",
      },
      {
        slug: "nanoid",
        label: "Nano ID Generator",
        description: "Generate short URL-safe IDs locally.",
      },
      {
        slug: "ulid",
        label: "ULID Generator",
        description: "Generate time-sortable ULIDs locally in your browser.",
      },
      {
        slug: "random-bytes",
        label: "Random Bytes Generator",
        description: "Generate random bytes / API keys locally (hex, base64, base64url).",
      },
      {
        slug: "lorem",
        label: "Lorem Ipsum Generator",
        description: "Generate lorem ipsum text locally.",
      },
      {
        slug: "case",
        label: "Text Case Converter",
        description: "Convert between common casing styles (camel, snake, kebab, title…).",
      },
      {
        slug: "lines",
        label: "Text Lines Tool",
        description: "Sort, dedupe, and clean up text lines.",
      },
    ],
  },
  {
    id: "calculators",
    label: "Calculators",
    items: [
      {
        slug: "time-zone",
        label: "Time Zone Converter",
        description: "Convert date/time between time zones (DST-aware).",
      },
      {
        slug: "timestamp",
        label: "Timestamp Converter",
        description: "Convert between Unix timestamps and dates.",
      },
      {
        slug: "date-diff",
        label: "Date Difference",
        description: "Compute time differences between two dates (days, hours, minutes).",
      },
      {
        slug: "percentage",
        label: "Percentage Calculator",
        description: "Quick percent calculations: X% of Y, change, increase/decrease.",
      },
      {
        slug: "tip",
        label: "Tip Calculator",
        description: "Calculate tip, total, and split per person.",
      },
      {
        slug: "discount",
        label: "Discount Calculator",
        description: "Calculate discount amount, final price, and totals (with optional sales tax).",
      },
      {
        slug: "sales-tax",
        label: "Sales Tax Calculator",
        description: "Compute sales tax and totals (add tax or tax-included).",
      },
      {
        slug: "mortgage",
        label: "Mortgage Calculator",
        description: "Estimate payment, totals, and payoff with extra payments.",
      },
      {
        slug: "home-affordability",
        label: "Home Affordability Calculator",
        description: "Estimate how much house you can afford using income, debts, and loan assumptions.",
      },
      {
        slug: "loan",
        label: "Loan Calculator",
        description: "Calculate loan payments, totals, and payoff with extra payments.",
      },
      {
        slug: "budget-50-30-20",
        label: "50/30/20 Budget",
        description: "Split your monthly income into needs, wants, and savings using the 50/30/20 rule.",
      },
      {
        slug: "apr-apy",
        label: "APR ↔ APY Converter",
        description: "Convert between APR and APY with compounding frequency.",
      },
      {
        slug: "salary",
        label: "Salary Calculator",
        description: "Convert between annual salary and hourly pay (monthly/biweekly/weekly).",
      },
      {
        slug: "take-home-pay",
        label: "Take-Home Pay Calculator",
        description: "Estimate paycheck take-home pay using custom tax rates and deductions.",
      },
      {
        slug: "auto-loan",
        label: "Auto Loan Calculator",
        description: "Estimate car payment (price, trade-in, down payment, taxes, fees).",
      },
      {
        slug: "net-worth",
        label: "Net Worth Calculator",
        description: "Calculate net worth from assets and liabilities.",
      },
      {
        slug: "credit-utilization",
        label: "Credit Utilization Calculator",
        description: "Calculate credit utilization per card and overall (balance ÷ limit).",
      },
      {
        slug: "emergency-fund",
        label: "Emergency Fund Calculator",
        description: "Estimate emergency fund target and time to reach it.",
      },
      {
        slug: "inflation",
        label: "Inflation Calculator",
        description: "Estimate future value or today’s value using an inflation rate.",
      },
      {
        slug: "four-percent-rule",
        label: "4% Rule Calculator",
        description: "Estimate retirement savings needed using a withdrawal rate (e.g., 4%).",
      },
      {
        slug: "fire",
        label: "FIRE Number Calculator",
        description: "Calculate your FIRE number and estimate years to financial independence.",
      },
      {
        slug: "gas-cost",
        label: "Gas Cost Calculator",
        description: "Estimate fuel needed and total gas cost for a trip (miles, MPG, $/gal).",
      },
      {
        slug: "rent-affordability",
        label: "Rent Affordability",
        description: "Estimate max affordable rent (or required income) using the rent-to-income rule.",
      },
      {
        slug: "rent-vs-buy",
        label: "Rent vs Buy Calculator",
        description: "Compare renting vs buying over time and estimate break-even.",
      },
      {
        slug: "debt-to-income",
        label: "Debt-to-Income (DTI)",
        description: "Calculate debt-to-income ratio (DTI) from monthly income and debts.",
      },
      {
        slug: "credit-card-payoff",
        label: "Credit Card Payoff",
        description: "Estimate payoff time and interest for a credit card balance.",
      },
      {
        slug: "debt-payoff-plan",
        label: "Debt Payoff Planner",
        description: "Plan debt payoff with snowball or avalanche strategy across multiple debts.",
      },
      {
        slug: "compound-interest",
        label: "Compound Interest",
        description: "Estimate future value with monthly contributions and compounding.",
      },
      {
        slug: "investment-fees",
        label: "Investment Fees Calculator",
        description: "Estimate how investment fees (expense ratio) affect long-term growth.",
      },
      {
        slug: "savings-goal",
        label: "Savings Goal Calculator",
        description: "Estimate time to reach a savings goal or required monthly savings.",
      },
      {
        slug: "retirement",
        label: "401(k) & Retirement Calculator",
        description: "Estimate retirement savings growth with contributions and employer match.",
      },
      {
        slug: "cagr",
        label: "CAGR Calculator",
        description: "Calculate compound annual growth rate (CAGR) and total return.",
      },
      {
        slug: "bmi",
        label: "BMI Calculator",
        description: "Calculate BMI (Body Mass Index) locally and show the healthy range.",
      },
      {
        slug: "unit-converter",
        label: "Unit Converter",
        description: "Convert between common units (length, mass, temperature, data size…).",
      },
      {
        slug: "number-base",
        label: "Number Base Converter",
        description: "Convert numbers between bases (2-36).",
      },
      {
        slug: "ip",
        label: "IPv4 CIDR Calculator",
        description: "Compute netmask, network, broadcast, and host range from CIDR.",
      },
    ],
  },
  {
    id: "other",
    label: "Other",
    items: [
      {
        slug: "rot13",
        label: "ROT13",
        description: "ROT13 transform for A-Z / a-z text.",
      },
      {
        slug: "morse",
        label: "Morse Encode/Decode",
        description: "Encode and decode International Morse code.",
      },
      {
        slug: "horoscope",
        label: "Daily Horoscope",
        description: "Daily horoscope by zodiac sign (for entertainment only).",
      },
      {
        slug: "zodiac-compatibility",
        label: "Zodiac Compatibility",
        description: "Fun compatibility score and tips by zodiac sign (entertainment only).",
      },
    ],
  },
];

const groups = rawGroups.map((group) => ({
  ...group,
  items: group.items.map((tool) => ({
    ...tool,
    group: group.id,
    groupLabel: group.label,
    path: normalizePath(`/tools/${tool.slug}/`),
  })),
}));

const all = groups.flatMap((group) => group.items);

for (const group of groups) {
  for (let i = 0; i < group.items.length; i += 1) {
    const tool = group.items[i];
    const prev = group.items[i - 1];
    const next = group.items[i + 1];
    tool.prevInGroup = prev
      ? { slug: prev.slug, label: prev.label, path: prev.path }
      : null;
    tool.nextInGroup = next
      ? { slug: next.slug, label: next.label, path: next.path }
      : null;
  }
}

const byPath = Object.fromEntries(all.map((tool) => [tool.path, tool]));
const bySlug = Object.fromEntries(all.map((tool) => [tool.slug, tool]));

const featuredSlugs = new Set([
  "base64",
  "url",
  "json",
  "hash",
  "uuid",
  "password",
  "time-zone",
  "tip",
  "horoscope",
  "sales-tax",
  "mortgage",
  "loan",
]);
const featured = all.filter((tool) => featuredSlugs.has(tool.slug));

module.exports = {
  groups,
  all,
  byPath,
  bySlug,
  featured,
};
