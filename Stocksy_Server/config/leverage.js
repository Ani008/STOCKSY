/**
 * config/leverage.js
 *
 * Flat-tier leverage model for MIS (intraday) orders.
 * CNC (delivery) is always 1x — full value, no leverage.
 *
 * Classification is based on actual current Nifty 50 membership
 * (verified against the live constituent list, not assumed) —
 * NOT simply "is this a large stock we track." A few of our
 * tracked symbols were Nifty 50 constituents in the past but have
 * since been replaced in index reconstitutions (e.g. BPCL, DIVISLAB,
 * HEROMOTOCO, BRITANNIA, LTIM were all removed in 2024-2025 rejigs).
 *
 * IMPORTANT: Nifty 50 reconstitutes semi-annually, cutoff dates
 * Jan 31 and Jul 31. Re-verify this list after each cutoff —
 * don't assume it's static.
 *
 * FLAGGED: TATAMOTORS — Tata Motors demerged into separate
 * passenger-vehicle / commercial-vehicle listings. The current
 * Nifty 50 constituent trades under the passenger-vehicle entity,
 * not necessarily the same instrument_key we're tracking. Defaulted
 * to the lower tier until confirmed — verify before promoting to 5x.
 */

const LEVERAGE = {
  CNC: 1,
  MIS_NIFTY50: 5,
  MIS_OTHER: 2.5,
};

// Verified against current Nifty 50 constituents (index membership
// as of the most recent reconstitution). Re-check after Jul 31 / Jan 31.
const NIFTY_50_SYMBOLS = new Set([
  'HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'BAJFINANCE', 'KOTAKBANK',
  'HDFCLIFE', 'BAJAJFINSV', 'TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM',
  'RELIANCE', 'ONGC', 'POWERGRID', 'NTPC', 'MARUTI', 'BAJAJ-AUTO',
  'EICHERMOT', 'HINDUNILVR', 'ITC', 'NESTLEIND', 'SUNPHARMA', 'DRREDDY',
  'CIPLA', 'TATASTEEL', 'HINDALCO', 'JSWSTEEL', 'COALINDIA', 'BHARTIARTL',
  'ADANIPORTS', 'ULTRACEMCO', 'LT', 'GRASIM', 'ADANIENT', 'BEL',
]);

/**
 * Returns the leverage multiplier for a given symbol + product type.
 * CNC is always 1x regardless of symbol.
 */
function getLeverage(symbol, productType) {
  if (productType !== 'MIS') return LEVERAGE.CNC;

  return NIFTY_50_SYMBOLS.has(symbol)
    ? LEVERAGE.MIS_NIFTY50
    : LEVERAGE.MIS_OTHER;
}

module.exports = {
  LEVERAGE,
  NIFTY_50_SYMBOLS,
  getLeverage,
};