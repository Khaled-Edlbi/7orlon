export type Locale = "en" | "ar";

/** The BCP-47 tag behind each of our two languages. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ar: "ar-EG",
};

const compactFormatters = new Map<string, Intl.NumberFormat>();
const fullFormatters = new Map<string, Intl.NumberFormat>();

function formatter(
  cache: Map<string, Intl.NumberFormat>,
  locale: Locale,
  options: Intl.NumberFormatOptions,
) {
  const key = `${locale}:${JSON.stringify(options)}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(INTL_LOCALE[locale], options);
    cache.set(key, f);
  }
  return f;
}

/**
 * "1.2K", "3M".
 *
 * Node's ICU and the browser's disagree about whether 1000 compacts to "1K" or
 * "1.0K". Left alone that is a hydration mismatch on any number that happens to
 * land on a round thousand, so we strip the dead ".0" on both sides and stop
 * the argument.
 */
export function compact(value: number, locale: Locale = "en"): string {
  const out = formatter(compactFormatters, locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
  return out.replace(/\.0([KMBT])/, "$1");
}

/** "1,234" — grouped, no decimals. */
export function full(value: number, locale: Locale = "en"): string {
  return formatter(fullFormatters, locale, {
    maximumFractionDigits: 0,
  }).format(value);
}

/** A change, always signed: "+12", "−4", "0". */
export function delta(value: number, locale: Locale = "en"): string {
  if (value === 0) return full(0, locale);
  const sign = value > 0 ? "+" : "−";
  return `${sign}${full(Math.abs(value), locale)}`;
}

// --- gallery-specific -------------------------------------------------------

/**
 * A price, from minor units. Prices are stored as BigInt cents and cross the
 * wire as strings, so this takes a string and never a float.
 */
export function price(
  minorUnits: string,
  currency: string,
  locale: Locale = "en",
): string {
  const major = Number(minorUnits) / 100;
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  return `${symbol}${full(major, locale)}`;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SAR: "SAR ",
};

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Arabic-Indic digits for `ar`, zero-padded Western digits for `en`. */
export function counter(n: number, locale: Locale): string {
  return locale === "ar"
    ? String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)])
    : String(n).padStart(2, "0");
}

/** Arabic-Indic digits for `ar`, plain Western digits for `en`. */
export function digits(n: number | string, locale: Locale): string {
  return locale === "ar"
    ? String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)])
    : String(n);
}
