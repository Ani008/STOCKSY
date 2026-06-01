import yfinance as yf
import requests
import time
import json

from financials import FINANCIALS_DATA
from company_profiles import COMPANY_PROFILES
from shareholding import SHAREHOLDING_DATA

# Configuration
SYMBOLS = ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "BAJFINANCE", "KOTAKBANK", "HDFCLIFE", "BAJAJFINSV", "TCS", "INFY", "WIPRO", "HCLTECH", "TECHM", "LTM", "RELIANCE", "ONGC", "BPCL", "POWERGRID", "NTPC", "MARUTI", "TMCV", "BAJAJ-AUTO", "EICHERMOT", "HEROMOTOCO", "HUL", "ITC", "NESTLE", "DABUR", "BRITANIA", "SUNPHARMA", "DRREDDY", "CIPLA", "DIVISLAB", "TATASTEEL", "HINDALCO", "JSWSTEEL", "COALINDIA", "BHARTIARTL", "ADANIPORTS", "ADANIGREEN", "ULTRACEMCO", "LT", "GRASIM", "VEDL", "BEL", "IRFC", "SUZLON"] # Add all 50+ here
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

    "POWERGRID": "infrastructure",
    "NTPC": "infrastructure",
    "LT": "infrastructure",
    "ADANIPORTS": "infrastructure",
    "ADANIGREEN": "infrastructure",

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

    "COALINDIA": "mining",

    "BHARTIARTL": "telecom",

    "ULTRACEMCO": "cement",

    "GRASIM": "chemicals",  

    "VEDL": "metals & mining",

    "BEL": "defence",

    "IRFC": "financial services",

    "SUZLON": "renewable energy",
}



#NORMALIZATION FUNCTION
def normalize_metrics(symbol, info):
    # ROE → decimal to percentage
    roe = info.get("returnOnEquity")

    if roe is not None:
        roe = round(roe * 100, 2)

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
        industry_pe = INDUSTRY_PE.get(industry)

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
    results = []
    
    print(f"🚀 Starting update for {len(symbol_list)} instruments...")

    for symbol in symbol_list:
        try:
            # 1. Handle Indian Market Suffix
            ticker_id = f"{symbol}.NS"
            stock = yf.Ticker(ticker_id)
            
            # 2. Use .info with fallback
            # We wrap this in a try-block because .info is the most likely to fail
            info = stock.info
            if not info:
                continue

            data = {
                "symbol": symbol,
                "metrics": normalize_metrics(symbol, info),
                "financials": FINANCIALS_DATA.get(symbol,{"quarterly": [],"yearly": []}),
                "profile": COMPANY_PROFILES.get(symbol, {}),
                "shareholding": SHAREHOLDING_DATA.get(symbol, {}),
                "last_updated": int(time.time())
            }
            
            results.append(data)
            print("\n==============================")
            print(f"✅ {symbol} FUNDAMENTALS")
            print("==============================")
            print(json.dumps(data, indent=2))

            # 3. Rate Limit Protection
            # A 0.5s sleep is usually enough for 50 stocks to stay under the radar
            time.sleep(0.5) 

        except Exception as e:
            print(f"❌ Failed to fetch {symbol}: {str(e)}")

    # 4. Batch Send to Node.js
    try:
        response = session.post(NODE_BACKEND_URL, json={"data": results}, timeout=10)
        if response.status_code == 200:
            print("🚀 Successfully synced with Node backend.")
        else:
            print(f"⚠️ Backend returned error: {response.status_code}")
    except Exception as e:
        print(f"🚨 Could not connect to backend: {e}")

if __name__ == "__main__":
    get_optimal_fundamentals(SYMBOLS)