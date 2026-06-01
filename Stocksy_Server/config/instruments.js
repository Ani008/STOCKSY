const INSTRUMENTS = {
  // Indices
  "NSE_INDEX|Nifty 50":      { symbol: "NIFTY 50",    name: "Nifty 50 Index",            sector: "Index" },
  "NSE_INDEX|Nifty Bank":    { symbol: "BANKNIFTY",   name: "Nifty Bank Index",          sector: "Index" },
  

  // Banking & Finance
  "NSE_EQ|INE040A01034":     { symbol: "HDFCBANK",    name: "HDFC Bank Ltd",             sector: "Banking" },
  "NSE_EQ|INE090A01021":     { symbol: "ICICIBANK",   name: "ICICI Bank Ltd",            sector: "Banking" },
  "NSE_EQ|INE062A01020":     { symbol: "SBIN",        name: "State Bank of India",       sector: "Banking" },
  "NSE_EQ|INE238A01034":     { symbol: "AXISBANK",    name: "Axis Bank Ltd",             sector: "Banking" },
  "NSE_EQ|INE296A01032":     { symbol: "BAJFINANCE",  name: "Bajaj Finance Ltd",         sector: "Finance" },
  "NSE_EQ|INE237A01036":     { symbol: "KOTAKBANK",   name: "Kotak Mahindra Bank",       sector: "Banking" },
  "NSE_EQ|INE795G01014":     { symbol: "HDFCLIFE",    name: "HDFC Life Insurance",       sector: "Insurance" },
  "NSE_EQ|INE918I01026":     { symbol: "BAJAJFINSV",  name: "Bajaj Finserv Ltd",         sector: "Finance" },

  // IT
  "NSE_EQ|INE467B01029":     { symbol: "TCS",         name: "Tata Consultancy Services", sector: "IT" },
  "NSE_EQ|INE009A01021":     { symbol: "INFY",        name: "Infosys Ltd",               sector: "IT" },
  "NSE_EQ|INE075A01022":     { symbol: "WIPRO",       name: "Wipro Ltd",                 sector: "IT" },
  "NSE_EQ|INE860A01027":     { symbol: "HCLTECH",     name: "HCL Technologies Ltd",      sector: "IT" },
  "NSE_EQ|INE669C01036":     { symbol: "TECHM",       name: "Tech Mahindra Ltd",         sector: "IT" },
  "NSE_EQ|INE214T01019":     { symbol: "LTIM",        name: "LTIMindtree Ltd",           sector: "IT" },

  // Oil & Energy
  "NSE_EQ|INE002A01018":     { symbol: "RELIANCE",    name: "Reliance Industries Ltd",   sector: "Energy" },
  "NSE_EQ|INE213A01029":     { symbol: "ONGC",        name: "Oil & Natural Gas Corp",    sector: "Energy" },
  "NSE_EQ|INE029A01011":     { symbol: "BPCL",        name: "Bharat Petroleum Corp",     sector: "Energy" },
  "NSE_EQ|INE752E01010":     { symbol: "POWERGRID",   name: "Power Grid Corp of India",  sector: "Energy" },
  "NSE_EQ|INE733E01010":     { symbol: "NTPC",        name: "NTPC Ltd",                  sector: "Energy" },

  // Auto
  "NSE_EQ|INE585B01010":     { symbol: "MARUTI",      name: "Maruti Suzuki India Ltd",   sector: "Auto" },
  "NSE_EQ|INE1TAE01010":     { symbol: "TATAMOTORS",  name: "Tata Motors Ltd",           sector: "Auto" },
  "NSE_EQ|INE917I01010":     { symbol: "BAJAJ-AUTO",  name: "Bajaj Auto Ltd",            sector: "Auto" },
  "NSE_EQ|INE066A01021":     { symbol: "EICHERMOT",   name: "Eicher Motors Ltd",         sector: "Auto" },
  "NSE_EQ|INE158A01026":     { symbol: "HEROMOTOCO",  name: "Hero MotoCorp Ltd",         sector: "Auto" },

  // FMCG
  "NSE_EQ|INE030A01027":     { symbol: "HINDUNILVR",  name: "Hindustan Unilever Ltd",    sector: "FMCG" },
  "NSE_EQ|INE154A01025":     { symbol: "ITC",         name: "ITC Ltd",                   sector: "FMCG" },
  "NSE_EQ|INE239A01024":     { symbol: "NESTLEIND",   name: "Nestle India Ltd",          sector: "FMCG" },
  "NSE_EQ|INE016A01026":     { symbol: "DABUR",       name: "Dabur India Ltd",           sector: "FMCG" },
  "NSE_EQ|INE216A01030":     { symbol: "BRITANNIA",   name: "Britannia Industries Ltd",  sector: "FMCG" },

  // Pharma
  "NSE_EQ|INE044A01036":     { symbol: "SUNPHARMA",   name: "Sun Pharmaceutical Ind",    sector: "Pharma" },
  "NSE_EQ|INE089A01031":     { symbol: "DRREDDY",     name: "Dr Reddy's Laboratories",   sector: "Pharma" },
  "NSE_EQ|INE059A01026":     { symbol: "CIPLA",       name: "Cipla Ltd",                 sector: "Pharma" },
  "NSE_EQ|INE361B01024":     { symbol: "DIVISLAB",    name: "Divi's Laboratories Ltd",   sector: "Pharma" },

  // Metals
  "NSE_EQ|INE081A01020":     { symbol: "TATASTEEL",   name: "Tata Steel Ltd",            sector: "Metals" },
  "NSE_EQ|INE038A01020":     { symbol: "HINDALCO",    name: "Hindalco Industries Ltd",   sector: "Metals" },
  "NSE_EQ|INE019A01038":     { symbol: "JSWSTEEL",    name: "JSW Steel Ltd",             sector: "Metals" },
  "NSE_EQ|INE522F01014":     { symbol: "COALINDIA",   name: "Coal India Ltd",            sector: "Metals" },

  // Telecom & Others
  "NSE_EQ|INE397D01024":     { symbol: "BHARTIARTL",  name: "Bharti Airtel Ltd",         sector: "Telecom" },
  "NSE_EQ|INE742F01042":     { symbol: "ADANIPORTS",  name: "Adani Ports & SEZ Ltd",     sector: "Infrastructure" },
  "NSE_EQ|INE364U01010":     { symbol: "ADANIGREEN",  name: "Adani Green Energy Ltd",    sector: "Energy" },
  "NSE_EQ|INE481G01011":     { symbol: "ULTRACEMCO",  name: "UltraTech Cement Ltd",      sector: "Infrastructure" },

  // Infrastructure & Capital Goods
  "NSE_EQ|INE018A01030":     { symbol: "LT",          name: "Larsen & Toubro Ltd",       sector: "Infrastructure" },
  "NSE_EQ|INE047A01021":     { symbol: "GRASIM",      name: "Grasim Industries Ltd",     sector: "Infrastructure" },
  "NSE_EQ|INE423A01024":     { symbol: "ADANIENT",    name: "Adani Enterprises Ltd",     sector: "Infrastructure" },
  "NSE_EQ|INE1NPP01017":     { symbol: "SIEMENS",     name: "Siemens Ltd",               sector: "Capital Goods" },

  "NSE_EQ|INE205A01025":     { symbol: "VEDL",        name: "Vedanta Ltd",               sector: "Mining & Metals" },
  "NSE_EQ|INE263A01024":     { symbol: "BEL",         name: "Bharat Electronics Ltd",    sector: "Defence" },
  "NSE_EQ|INE053F01010":     { symbol: "IRFC",        name: "IRFC Ltd",                  sector: "Financial Services" },
  "NSE_EQ|INE040H01021":     { symbol: "SUZLON",      name: "Suzlon Energy Ltd",         sector: "Renewable Energy" },
};


module.exports = INSTRUMENTS;