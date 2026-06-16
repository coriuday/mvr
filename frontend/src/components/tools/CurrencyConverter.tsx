"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, RefreshCw, AlertCircle } from "lucide-react";

interface Currency {
  code: string;
  name: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  // Anglophone / major destinations
  { code: "USD", name: "US Dollar",          flag: "🇺🇸" },
  { code: "GBP", name: "British Pound",      flag: "🇬🇧" },
  { code: "CAD", name: "Canadian Dollar",    flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar",  flag: "🇦🇺" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  // Eurozone
  { code: "EUR", name: "Euro",               flag: "🇪🇺" },
  // Non-euro Europe
  { code: "CHF", name: "Swiss Franc",        flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona",      flag: "🇸🇪" },
  { code: "DKK", name: "Danish Krone",       flag: "🇩🇰" },
  { code: "HUF", name: "Hungarian Forint",   flag: "🇭🇺" },
  { code: "RUB", name: "Russian Ruble",      flag: "🇷🇺" },
  { code: "GEL", name: "Georgian Lari",      flag: "🇬🇪" },
  // Asia-Pacific
  { code: "SGD", name: "Singapore Dollar",   flag: "🇸🇬" },
  { code: "MYR", name: "Malaysian Ringgit",  flag: "🇲🇾" },
  { code: "JPY", name: "Japanese Yen",       flag: "🇯🇵" },
  // Middle East
  { code: "AED", name: "UAE Dirham",         flag: "🇦🇪" },
];

// Static fallback rates (INR per 1 unit of foreign currency — approx. May 2026)
const FALLBACK_RATES: Record<string, number> = {
  USD: 83.5,
  GBP: 106.5,
  CAD: 61.8,
  AUD: 54.3,
  NZD: 50.1,
  EUR: 90.2,
  CHF: 94.8,
  SEK:  7.9,
  DKK: 12.1,
  HUF:  0.23,
  RUB:  0.93,
  GEL: 30.5,
  SGD: 62.1,
  MYR: 18.7,
  JPY:  0.55,
  AED: 22.7,
};


export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("100000");
  const [fromCurrency, setFromCurrency] = useState<string>("INR");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const base = fromCurrency === "INR" ? "INR" : fromCurrency;
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.result !== "success") throw new Error("API error");

      if (fromCurrency === "INR") {
        // Rates are: 1 INR = X foreign currency
        // We want: 1 foreign currency = Y INR
        const inverted: Record<string, number> = {};
        for (const cur of CURRENCIES) {
          if (data.rates[cur.code]) {
            inverted[cur.code] = 1 / data.rates[cur.code];
          }
        }
        setRates(inverted);
      } else {
        // Rates include INR directly
        const filtered: Record<string, number> = {};
        for (const cur of CURRENCIES) {
          if (data.rates[cur.code]) filtered[cur.code] = data.rates[cur.code];
        }
        if (data.rates.INR) filtered.INR = data.rates.INR;
        setRates(filtered);
      }
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setError(true);
      setRates(FALLBACK_RATES);
    } finally {
      setLoading(false);
    }
  }, [fromCurrency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;

  function convert(targetCode: string): string {
    if (fromCurrency === "INR") {
      const rate = rates[targetCode];
      if (!rate) return "—";
      const result = numAmount / rate;
      if (targetCode === "JPY") return result.toLocaleString("en-IN", { maximumFractionDigits: 0 });
      return result.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    } else {
      // fromCurrency is foreign, target might be INR or another foreign
      if (targetCode === "INR") {
        const rate = rates.INR ?? FALLBACK_RATES[fromCurrency];
        return (numAmount * rate).toLocaleString("en-IN", { maximumFractionDigits: 2 });
      }
      const rate = rates[targetCode];
      if (!rate) return "—";
      return (numAmount * rate).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    }
  }

  const allCurrencies = fromCurrency === "INR" ? CURRENCIES : [{ code: "INR", name: "Indian Rupee", flag: "🇮🇳" }, ...CURRENCIES.filter((c) => c.code !== fromCurrency)];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                {fromCurrency === "INR" ? "₹" : CURRENCIES.find((c) => c.code === fromCurrency)?.flag ?? ""}
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full text-2xl font-bold text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-4 focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">From Currency</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full text-sm text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-[#c9a84c] transition-colors"
            >
              <option value="INR">🇮🇳 INR — Indian Rupee</option>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {error ? (
              <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <AlertCircle size={12} className="shrink-0" />
                Live rates unavailable — showing <strong className="mx-0.5">estimated May 2026</strong> rates. Figures may be inaccurate.
              </span>
            ) : lastUpdated ? (
              <><span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" /> Live rates · Updated {lastUpdated}</>
            ) : (
              <span>Loading rates...</span>
            )}
          </div>
          <button
            onClick={fetchRates}
            disabled={loading}
            className={`flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 transition-colors ${
              error
                ? "text-amber-700 bg-amber-50 border border-amber-300 px-2.5 py-1.5 rounded-lg hover:bg-amber-100"
                : "text-[#c9a84c] hover:text-[#a07a2e]"
            }`}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {error ? "Retry" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Conversion results */}
      <div className="grid sm:grid-cols-2 gap-3">
        {allCurrencies.map((cur) => {
          const converted = convert(cur.code);
          const rateDisplay = fromCurrency === "INR"
            ? `1 ${cur.code} = ₹${(rates[cur.code] ?? 0).toFixed(2)}`
            : cur.code === "INR"
            ? `1 ${fromCurrency} = ₹${(rates.INR ?? FALLBACK_RATES[fromCurrency] ?? 0).toFixed(2)}`
            : `1 ${fromCurrency} = ${(rates[cur.code] ?? 0).toFixed(4)} ${cur.code}`;


          return (
            <div
              key={cur.code}
              className="rounded-2xl border border-gray-100 bg-white p-5 flex items-center justify-between transition-all hover:shadow-sm hover:border-[#c9a84c]/40"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cur.flag}</span>
                <div>
                  <p className="font-bold text-[#1a2f5e] text-sm">{cur.code}</p>
                  <p className="text-gray-400 text-xs">{cur.name}</p>
                  <p className="text-gray-300 text-xs">{rateDisplay}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-[#1a2f5e]">
                  {loading ? <span className="text-gray-300">—</span> : converted}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick presets */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Amounts (INR)</p>
        <div className="flex flex-wrap gap-2">
          {[50000, 100000, 500000, 1000000, 5000000].map((v) => (
            <button
              key={v}
              onClick={() => {
                setFromCurrency("INR");
                setAmount(String(v));
              }}
              className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#c9a84c] hover:text-[#1a2f5e] transition-all"
            >
              ₹{v >= 100000 ? `${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L` : `${v / 1000}K`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
