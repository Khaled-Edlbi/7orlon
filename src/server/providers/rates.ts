import "server-only";

import type { Rates } from "@/features/paintings/types";

/**
 * Currency conversion lives behind this interface.
 *
 * Prices are stored in USD cents. If the studio ever wants to quote in euros,
 * the only thing that changes is which implementation `getRatesProvider()`
 * returns — no feature, page or component knows where a rate came from.
 */
export interface RatesProvider {
  readonly name: string;
  /** Rates relative to `base`. Throws `ProviderError` if the source is down. */
  getRates(base: string): Promise<Rates>;
}

/** An upstream we do not control failed. Route handlers turn this into a 422. */
export class ProviderError extends Error {
  readonly provider: string;
  readonly cause?: unknown;

  constructor(provider: string, message: string, cause?: unknown) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.cause = cause;
  }
}

/**
 * The default. No network, no key, same answer every time — which is what you
 * want in development and in tests. The numbers are indicative, not live.
 */
const staticProvider: RatesProvider = {
  name: "static",
  async getRates(base) {
    if (base !== "USD") {
      throw new ProviderError(
        "static",
        `The static rate table is quoted against USD, not ${base}.`,
      );
    }
    return {
      base: "USD",
      rates: { USD: 1, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75 },
      fetchedAt: new Date(0).toISOString(),
    };
  },
};

/**
 * Live rates from exchangerate.host. Unofficial sources go stale, change shape
 * and rate-limit, which is exactly why they are quarantined in this file.
 */
const exchangerateHostProvider: RatesProvider = {
  name: "exchangerate-host",
  async getRates(base) {
    const key = process.env.RATES_API_KEY;
    if (!key) {
      throw new ProviderError(
        "exchangerate-host",
        "RATES_API_KEY is not set.",
      );
    }

    const url = new URL("https://api.exchangerate.host/live");
    url.searchParams.set("access_key", key);
    url.searchParams.set("source", base);

    let payload: unknown;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) {
        throw new ProviderError(
          "exchangerate-host",
          `Upstream responded ${res.status}.`,
        );
      }
      payload = await res.json();
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(
        "exchangerate-host",
        "Could not reach the rate source.",
        error,
      );
    }

    const quotes =
      typeof payload === "object" && payload !== null && "quotes" in payload
        ? (payload as { quotes: Record<string, number> }).quotes
        : null;

    if (!quotes) {
      throw new ProviderError(
        "exchangerate-host",
        "Upstream returned a shape we do not recognise.",
      );
    }

    // The API keys quotes as "USDEUR"; we want "EUR".
    const rates: Record<string, number> = { [base]: 1 };
    for (const [pair, value] of Object.entries(quotes)) {
      if (pair.startsWith(base) && typeof value === "number" && value > 0) {
        rates[pair.slice(base.length)] = value;
      }
    }

    return { base, rates, fetchedAt: new Date().toISOString() };
  },
};

export function getRatesProvider(): RatesProvider {
  return process.env.RATES_PROVIDER === "exchangerate-host"
    ? exchangerateHostProvider
    : staticProvider;
}
