import yfinance as yf
import requests
import time
import json

from financials import FINANCIALS_DATA
from company_profiles import COMPANY_PROFILES
from shareholding import SHAREHOLDING_DATA

# Configuration
SYMBOLS = ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "BAJFINANCE", "KOTAKBANK", "HDFCLIFE", "BAJAJFINSV", "TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "LTM", "RELIANCE", "ONGC", "BPCL", "POWERGRID", "NTPC", "MARUTI", "TMCV", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO", "HINDUNILVR", "ITC", "NESTLE", "DABUR", "BRITANNIA", "SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "TATASTEEL", "HINDALCO", "JSWSTEEL", "COALINDIA", "BHARTIARTL", "ADANIPORTS", "ADANIGREEN", "ULTRACEMCO", "LT", "GRASIM", "VEDL", "BEL", "IRFC", "SUZLON"] # Add all 50+ here
NODE_BACKEND_URL = "http://localhost:5000/api/fundamentals" # Your Node.js endpoint


INDUSTRY_PE = {
    "Banking": 14.2,
    "IT Services": 28.5,
    "Oil & Gas": 12.4,
    "Automobile": 24.1,
    "Fmcg": 48.8,
    "Pharmaceuticals": 35.36,
    "Steel": 27.5,
    "Mining": 11.5,
    "Telecom": 39.63,
    "Infrastructure": 22.5,
    "Cement": 33.34,
    "Chemicals": 40.7,
    "Metals & Mining": 18.5,
    "Defence": 45.2,
    "Financial Services": 21.3,
    "Renewable Energy": 58.4,
}

STOCK_INDUSTRY = {
    "HDFCBANK": "Banking",
    "ICICIBANK": "Banking",
    "SBIN": "Banking",
    "AXISBANK": "Banking",
    "BAJFINANCE": "Banking",
    "KOTAKBANK": "Banking",
    "HDFCLIFE": "Banking",
    "BAJAJFINSV": "Banking",

    "TCS": "IT Services",
    "INFY": "IT Services",
    "WIPRO": "IT Services",
    "HCLTECH": "IT Services",
    "TECHM": "IT Services",
    "LTM": "IT Services",

    "RELIANCE": "Oil & Gas",
    "ONGC": "Oil & Gas",
    "BPCL": "Oil & Gas",

    "POWERGRID": "Infrastructure",
    "NTPC": "Infrastructure",
    "LT": "Infrastructure",
    "ADANIPORTS": "Infrastructure",
    "ADANIGREEN": "Infrastructure",

    "MARUTI": "Automobile",
    "TMCV": "Automobile",
    "BAJAJ-AUTO": "Automobile",
    "EICHERMOT": "Automobile",
    "HEROMOTOCO": "Automobile",

    "HUL": "Fmcg",
    "ITC": "Fmcg",
    "NESTLE": "Fmcg",
    "DABUR": "Fmcg",
    "BRITANIA": "Fmcg",

    "SUNPHARMA": "Pharmaceuticals",
    "DRREDDY": "Pharmaceuticals",
    "CIPLA": "Pharmaceuticals",
    "DIVISLAB": "Pharmaceuticals",

    "TATASTEEL": "Steel",
    "HINDALCO": "Steel",
    "JSWSTEEL": "Steel",

    "COALINDIA": "Mining",

    "BHARTIARTL": "Telecom",

    "ULTRACEMCO": "Cement",

    "GRASIM": "Chemicals",

    "VEDL": "Metals & Mining",

    "BEL": "Defence",

    "IRFC": "Financial Services",

    "SUZLON": "Renewable Energy",
}



#NORMALIZATION FUNCTION
def normalize_metrics(symbol, info):
    # ROE → decimal to percentage
    roe = info.get("returnOnEquity")

    if roe is not None:
        roe = round(roe * 100, 2)
    else:
        # Yahoo doesn't populate returnOnEquity for every ticker — rather
        # than leave it blank, derive it from data we already have:
        # ROE = Net Income / Equity = (Net Income / Shares) / (Equity / Shares)
        #     = EPS / Book Value per share
        # This is the standard practitioner shortcut, not a guess — it's
        # exact as long as share count is stable, which holds for all of
        # these large-caps.
        eps = info.get("trailingEps")
        book_value = info.get("bookValue")
        if eps and book_value and book_value > 0:
            roe = round((eps / book_value) * 100, 2)
            print(f"ℹ️  {symbol}: ROE derived from EPS/BookValue ({roe}%) — Yahoo didn't provide returnOnEquity directly")
        else:
            print(f"⚠️  {symbol}: ROE unavailable — Yahoo has neither returnOnEquity nor enough data to derive it")

    # Dividend Yield
    dividend_yield = info.get("dividendYield")

    if dividend_yield is not None:
        # Yahoo sometimes gives 0.0045
        if dividend_yield < 1:
            dividend_yield = round(dividend_yield * 100, 2)
        else:
            dividend_yield = round(dividend_yield, 2)

    # Market Cap → convert to Cr
    market_cap = info.get("marketCap")

    if market_cap:
        market_cap = round(market_cap / 10000000, 2)

    # Debt to Equity normalization
    debt_to_equity = info.get("debtToEquity")

    if debt_to_equity is not None:
        if debt_to_equity > 10:
            debt_to_equity = round(
                debt_to_equity / 100,
                2
            )
        else:
            debt_to_equity = round(
                debt_to_equity,
                2
            )

    industry = STOCK_INDUSTRY.get(symbol)
    industry_pe = None
    if industry:
        # Case-insensitive match — a silent casing mismatch between this
        # dict and INDUSTRY_PE's keys is exactly what caused industry_pe
        # to go missing for several stocks before. This makes that class
        # of bug impossible to recur silently.
        industry_pe = next(
            (v for k, v in INDUSTRY_PE.items() if k.lower() == industry.lower()),
            None
        )
        if industry_pe is None:
            print(f"⚠️  No industry_pe found for '{industry}' ({symbol}) — check INDUSTRY_PE keys")

    return {
        "market_cap": market_cap,

        "pe_ratio": round(
            info.get("trailingPE", 0) or 0,
            2
        ),

        "pb_ratio": round(
            info.get("priceToBook", 0) or 0,
            2
        ),

        "industry_pe": industry_pe,

        "debt_to_equity": debt_to_equity,

        "roe": roe,

        "eps": round(
            info.get("trailingEps", 0) or 0,
            2
        ),

        "dividend_yield": dividend_yield,

        "book_value": round(
            info.get("bookValue", 0) or 0,
            2
        ),

        # remove fake placeholder
        "face_value": None
    }

def get_optimal_fundamentals(symbol_list):
    session = requests.Session()
    snapshot = {
    "generated_at": int(time.time()),
    "version": 1,
    "stocks": {}
}
    success = 0
    failed = 0
    failed_symbols = []

    print(f"🚀 Starting update for {len(symbol_list)} instruments...")

    # ── Warm-up call ──────────────────────────────────────────────────────
    # yfinance's very first request in a fresh run often comes back empty
    # while it establishes a session/cookie handshake with Yahoo — even
    # though the identical call succeeds a moment later. Without this,
    # whichever symbols happen to sit first in symbol_list silently lose
    # their data every single run, not because Yahoo lacks it, but
    # because we asked before the session was ready.
    try:
        print("🔥 Warming up yfinance session...")
        yf.Ticker(f"{symbol_list[0]}.NS").info
        time.sleep(1)
    except Exception:
        pass  # warm-up failing isn't fatal — real fetches below still retry

    try:
        for symbol in symbol_list:
            try:
                # 1. Handle Indian Market Suffix
                ticker_id = f"{symbol}.NS"
                stock = yf.Ticker(ticker_id)

                # 2. Use .info with fallback — retry once if empty, since this
                # is usually transient (cold-start / a momentary rate-limit),
                # not a real "this stock doesn't exist" case.
                info = stock.info
                if not info:
                    print(f"⚠️  {symbol}: empty response, retrying once in 2s...")
                    time.sleep(2)
                    info = yf.Ticker(ticker_id).info

                if not info:
                    failed += 1
                    failed_symbols.append(symbol)
                    print(f"❌ {symbol}: still empty after retry — skipped this run")
                    time.sleep(0.5)
                    continue

                data = {
                    "symbol": symbol,
                    "metrics": normalize_metrics(symbol, info),
                    "financials": FINANCIALS_DATA.get(symbol,{"quarterly": [],"yearly": []}),
                    "profile": COMPANY_PROFILES.get(symbol, {}),
                    "shareholding": SHAREHOLDING_DATA.get(symbol, {}),
                    "last_updated": int(time.time())
                }

                snapshot["stocks"][symbol] = data
                success += 1
                print(f"✅ {symbol} FUNDAMENTALS")

                # 3. Rate Limit Protection
                # A 0.5s sleep is usually enough for 50 stocks to stay under the radar
                time.sleep(0.5)

            except Exception as e:
                failed += 1
                failed_symbols.append(symbol)
                print(f"❌ Failed to fetch {symbol}: {str(e)}")
    finally:
        # Runs even on Ctrl+C or an unexpected crash — whatever was
        # successfully fetched before the interruption still gets saved,
        # same safety net the old per-iteration save gave you, just
        # without paying the disk-write cost on every single symbol.
        print("\n💾 Saving fundamentals snapshot...")
        with open(
            "fundamentals_snapshot.json",
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(snapshot, file, indent=2)

        print("✅ Snapshot saved.")
        print("\n========================")
        print(f"Fetched : {success}")
        print(f"Failed  : {failed}")
        if failed_symbols:
            print(f"Failed symbols: {', '.join(failed_symbols)}")
        print(f"Total   : {len(symbol_list)}")
        print("========================\n")
        

    # 4. Batch Send to Node.js
    try:
        response = session.post(NODE_BACKEND_URL, json=snapshot, timeout=10)
        if response.status_code == 200:
            print("🚀 Successfully synced with Node backend.")
        else:
            print(f"⚠️ Backend returned error: {response.status_code}")
    except Exception as e:
        print(f"🚨 Could not connect to backend: {e}")

if __name__ == "__main__":
    get_optimal_fundamentals(SYMBOLS)