/**
 * config/marketHolidays.js
 *
 * NSE/BSE equity-segment trading holiday calendar.
 *
 * Only WEEKDAY holidays need to be listed here — holidays that already
 * fall on a Saturday/Sunday (e.g. Maha Shivaratri, Eid-Ul-Fitr in 2026)
 * are already covered by the weekend check in marketCalendarService and
 * are deliberately omitted to avoid a redundant source of truth.
 *
 * Source: official NSE/BSE holiday circular, cross-checked against
 * https://zerodha.com/marketintel/holiday-calendar/ (Equity/Derivatives/SLB
 * segment — "nse bse" rows only, not MCX-only or settlement-only holidays).
 *
 * IMPORTANT: This list is published by the exchanges once a year, usually
 * in December for the following year. Re-verify and update every December
 * — do NOT assume this file carries forward automatically. An outdated
 * list will incorrectly show the market as "open" on a real holiday, which
 * lets orders through that a real broker would reject.
 *
 * Format: 'YYYY-MM-DD' (IST calendar date) → holiday name.
 */

const MARKET_HOLIDAYS_2026 = {
  '2026-01-15': 'Municipal Corporation Elections in Maharashtra',
  '2026-01-26': 'Republic Day',
  '2026-03-03': 'Holi',
  '2026-03-26': 'Shri Ram Navami',
  '2026-03-31': 'Shri Mahavir Jayanti',
  '2026-04-03': 'Good Friday',
  '2026-04-14': 'Dr. Baba Saheb Ambedkar Jayanti',
  '2026-05-01': 'Maharashtra Day',
  '2026-05-28': 'Bakri Eid',
  '2026-06-26': 'Moharram',
  '2026-09-14': 'Ganesh Chaturthi',
  '2026-10-02': 'Mahatma Gandhi Jayanti',
  '2026-10-20': 'Dussehra',
  '2026-11-10': 'Diwali-Balipratipada',
  '2026-11-24': 'Prakash Gurpurb Sri Guru Nanak Dev',
  '2026-12-25': 'Christmas',
};

// Merge additional years in here as they're published, e.g.:
// const MARKET_HOLIDAYS_2027 = { ... };
const MARKET_HOLIDAYS = {
  ...MARKET_HOLIDAYS_2026,
};

/**
 * @param {string} isoDate 'YYYY-MM-DD' (IST calendar date)
 * @returns {string|null} holiday name if it's a holiday, else null
 */
function getHolidayName(isoDate) {
  return MARKET_HOLIDAYS[isoDate] || null;
}

function isTradingHoliday(isoDate) {
  return Object.prototype.hasOwnProperty.call(MARKET_HOLIDAYS, isoDate);
}

module.exports = {
  MARKET_HOLIDAYS,
  getHolidayName,
  isTradingHoliday,
};