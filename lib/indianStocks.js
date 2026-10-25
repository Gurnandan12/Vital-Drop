/**
 * lib/indianStocks.ts
 * ─────────────────────────────────────────────────────────
 * Curated static dataset of ~200 Indian stocks covering:
 * - All 12 major sectors (NSE classification)
 * - All 3 market cap tiers (Large / Mid / Small)
 * - Both exchanges (NSE .NS and BSE .BO)
 * - Special asset types (Gold ETF, Silver ETF)
 *
 * Used for:
 * 1. Instant client-side search (no API call needed)
 * 2. Multi-filter browse (sector / cap / exchange / type)
 * 3. Populating the Market Dashboard grid
 *
 * Live quotes (price / % change) are fetched from Yahoo Finance
 * ONLY when a specific stock is selected — same pattern as Groww/Zerodha.
 */
/* ─────────────────────────────────────────────────────────
   DATASET
───────────────────────────────────────────────────────── */
export const INDIAN_STOCKS = [
    // ── BANKING ─────────────────────────────────────────────
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BANDHANBNK.NS', name: 'Bandhan Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'IDFCFIRSTB.NS', name: 'IDFC First Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'PNB.NS', name: 'Punjab National Bank', exchange: 'NSE', sector: 'Banking', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BANKBARODA.NS', name: 'Bank of Baroda', exchange: 'NSE', sector: 'Banking', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'CANBK.NS', name: 'Canara Bank', exchange: 'NSE', sector: 'Banking', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'FEDERALBNK.NS', name: 'Federal Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'RBLBANK.NS', name: 'RBL Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Small Cap', assetType: 'Equity' },
    { symbol: 'DCBBANK.NS', name: 'DCB Bank Ltd.', exchange: 'NSE', sector: 'Banking', capCategory: 'Small Cap', assetType: 'Equity' },
    { symbol: 'KARURVYSYA.NS', name: 'Karur Vysya Bank', exchange: 'NSE', sector: 'Banking', capCategory: 'Small Cap', assetType: 'Equity' },
    // ── IT / TECHNOLOGY ──────────────────────────────────────
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'INFY.NS', name: 'Infosys Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'WIPRO.NS', name: 'Wipro Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'LTIM.NS', name: 'LTIMindtree Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'MPHASIS.NS', name: 'Mphasis Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'PERSISTENT.NS', name: 'Persistent Systems Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'COFORGE.NS', name: 'Coforge Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'KPITTECH.NS', name: 'KPIT Technologies Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'NIITTECH.NS', name: 'NIIT Technologies Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Small Cap', assetType: 'Equity' },
    { symbol: 'MASTEK.NS', name: 'Mastek Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Small Cap', assetType: 'Equity' },
    // ── PHARMA / HEALTHCARE ──────────────────────────────────
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', exchange: 'NSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'DRREDDY.NS', name: 'Dr. Reddy\'s Laboratories', exchange: 'NSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'CIPLA.NS', name: 'Cipla Ltd.', exchange: 'NSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'DIVISLAB.NS', name: 'Divi\'s Laboratories', exchange: 'NSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise', exchange: 'NSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'LUPIN.NS', name: 'Lupin Ltd.', exchange: 'NSE', sector: 'Pharma', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'AUROPHARMA.NS', name: 'Aurobindo Pharma Ltd.', exchange: 'NSE', sector: 'Pharma', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BIOCON.NS', name: 'Biocon Ltd.', exchange: 'NSE', sector: 'Pharma', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'GLENMARK.NS', name: 'Glenmark Pharmaceuticals', exchange: 'NSE', sector: 'Pharma', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'TORNTPHARM.NS', name: 'Torrent Pharmaceuticals', exchange: 'NSE', sector: 'Pharma', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'IPCALAB.NS', name: 'IPCA Laboratories Ltd.', exchange: 'NSE', sector: 'Pharma', capCategory: 'Small Cap', assetType: 'Equity' },
    // ── FMCG ─────────────────────────────────────────────────
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ITC.NS', name: 'ITC Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'NESTLEIND.NS', name: 'Nestlé India Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'BRITANNIA.NS', name: 'Britannia Industries Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'DABUR.NS', name: 'Dabur India Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'MARICO.NS', name: 'Marico Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'GODREJCP.NS', name: 'Godrej Consumer Products', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'COLPAL.NS', name: 'Colgate-Palmolive India', exchange: 'NSE', sector: 'FMCG', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'EMAMILTD.NS', name: 'Emami Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'VBL.NS', name: 'Varun Beverages Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── ENERGY ───────────────────────────────────────────────
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp.', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corp.', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'IOC.NS', name: 'Indian Oil Corporation', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'NTPC.NS', name: 'NTPC Ltd.', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TATAPOWER.NS', name: 'Tata Power Company Ltd.', exchange: 'NSE', sector: 'Energy', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy Ltd.', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'GAIL.NS', name: 'GAIL India Ltd.', exchange: 'NSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'PETRONET.NS', name: 'Petronet LNG Ltd.', exchange: 'NSE', sector: 'Energy', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'HINDPETRO.NS', name: 'Hindustan Petroleum Corp.', exchange: 'NSE', sector: 'Energy', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── METAL / MINING ───────────────────────────────────────
    { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'HINDALCO.NS', name: 'Hindalco Industries Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'VEDL.NS', name: 'Vedanta Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'COALINDIA.NS', name: 'Coal India Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'NMDC.NS', name: 'NMDC Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'SAIL.NS', name: 'Steel Authority of India', exchange: 'NSE', sector: 'Metal', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'NATIONALUM.NS', name: 'National Aluminium Company', exchange: 'NSE', sector: 'Metal', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'HINDZINC.NS', name: 'Hindustan Zinc Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'APLAPOLLO.NS', name: 'APL Apollo Tubes Ltd.', exchange: 'NSE', sector: 'Metal', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── AUTOMOBILE ───────────────────────────────────────────
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ASHOKLEY.NS', name: 'Ashok Leyland Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'TVSMOTOR.NS', name: 'TVS Motor Company Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'MOTHERSON.NS', name: 'Samvardhana Motherson', exchange: 'NSE', sector: 'Automobile', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BOSCHLTD.NS', name: 'Bosch Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BHARATFORG.NS', name: 'Bharat Forge Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'MRF.NS', name: 'MRF Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'CEATLTD.NS', name: 'CEAT Ltd.', exchange: 'NSE', sector: 'Automobile', capCategory: 'Small Cap', assetType: 'Equity' },
    // ── TELECOM ──────────────────────────────────────────────
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd.', exchange: 'NSE', sector: 'Telecom', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'IDEA.NS', name: 'Vodafone Idea Ltd.', exchange: 'NSE', sector: 'Telecom', capCategory: 'Small Cap', assetType: 'Equity' },
    { symbol: 'TATACOMM.NS', name: 'Tata Communications Ltd.', exchange: 'NSE', sector: 'Telecom', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'HFCL.NS', name: 'HFCL Ltd.', exchange: 'NSE', sector: 'Telecom', capCategory: 'Small Cap', assetType: 'Equity' },
    { symbol: 'INDIAMART.NS', name: 'IndiaMart InterMESH Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── INFRASTRUCTURE / CAPITAL GOODS ───────────────────────
    { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'GRASIM.NS', name: 'Grasim Industries Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'AMBUJACEM.NS', name: 'Ambuja Cements Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ACC.NS', name: 'ACC Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'SIEMENS.NS', name: 'Siemens Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'ABB.NS', name: 'ABB India Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BHEL.NS', name: 'Bharat Heavy Electricals Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'HAL.NS', name: 'Hindustan Aeronautics Ltd.', exchange: 'NSE', sector: 'PSU', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'BEL.NS', name: 'Bharat Electronics Ltd.', exchange: 'NSE', sector: 'PSU', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'IRCTC.NS', name: 'Indian Railway Catering & Tourism', exchange: 'NSE', sector: 'PSU', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'INDIANB.NS', name: 'Indian Bank', exchange: 'NSE', sector: 'PSU', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'RVNL.NS', name: 'Rail Vikas Nigam Ltd.', exchange: 'NSE', sector: 'PSU', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'IRFC.NS', name: 'Indian Railway Finance Corp.', exchange: 'NSE', sector: 'PSU', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── PSU ──────────────────────────────────────────────────
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'DLF.NS', name: 'DLF Ltd.', exchange: 'NSE', sector: 'Realty', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'GODREJPROP.NS', name: 'Godrej Properties Ltd.', exchange: 'NSE', sector: 'Realty', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'PRESTIGE.NS', name: 'Prestige Estates Projects', exchange: 'NSE', sector: 'Realty', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'OBEROIRLTY.NS', name: 'Oberoi Realty Ltd.', exchange: 'NSE', sector: 'Realty', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BRIGADE.NS', name: 'Brigade Enterprises Ltd.', exchange: 'NSE', sector: 'Realty', capCategory: 'Small Cap', assetType: 'Equity' },
    { symbol: 'PHOENIXLTD.NS', name: 'Phoenix Mills Ltd.', exchange: 'NSE', sector: 'Realty', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── NBFC / FINANCE ───────────────────────────────────────
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Company', exchange: 'NSE', sector: 'NBFC', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance Company', exchange: 'NSE', sector: 'NBFC', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ICICIPRULI.NS', name: 'ICICI Prudential Life Ins.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'CHOLAFIN.NS', name: 'Cholamandalam Investment', exchange: 'NSE', sector: 'NBFC', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'MUTHOOTFIN.NS', name: 'Muthoot Finance Ltd.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'MANAPPURAM.NS', name: 'Manappuram Finance Ltd.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'LICHSGFIN.NS', name: 'LIC Housing Finance Ltd.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'PNBHOUSING.NS', name: 'PNB Housing Finance Ltd.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Small Cap', assetType: 'Equity' },
    { symbol: 'SHRIRAMFIN.NS', name: 'Shriram Finance Ltd.', exchange: 'NSE', sector: 'NBFC', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── CONSUMER / RETAIL ────────────────────────────────────
    { symbol: 'TITAN.NS', name: 'Titan Company Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'PIDILITIND.NS', name: 'Pidilite Industries Ltd.', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'HAVELLS.NS', name: 'Havells India Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'VOLTAS.NS', name: 'Voltas Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'BLUEDART.NS', name: 'Blue Dart Express Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'ZOMATO.NS', name: 'Zomato Ltd.', exchange: 'NSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'PAYTM.NS', name: 'One97 Communications (Paytm)', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'NYKAA.NS', name: 'FSN E-Commerce (Nykaa)', exchange: 'NSE', sector: 'IT', capCategory: 'Mid Cap', assetType: 'Equity' },
    { symbol: 'POLICYBZR.NS', name: 'PB Fintech (PolicyBazaar)', exchange: 'NSE', sector: 'NBFC', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── CONGLOMERATE ─────────────────────────────────────────
    { symbol: 'TATACONSUL.NS', name: 'Tata Consumer Products', exchange: 'NSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TATACHEMICALS.NS', name: 'Tata Chemicals Ltd.', exchange: 'NSE', sector: 'Infrastructure', capCategory: 'Mid Cap', assetType: 'Equity' },
    // ── BSE-LISTED ───────────────────────────────────────────
    { symbol: 'RELIANCE.BO', name: 'Reliance Industries Ltd.', exchange: 'BSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TCS.BO', name: 'Tata Consultancy Services', exchange: 'BSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'HDFCBANK.BO', name: 'HDFC Bank Ltd.', exchange: 'BSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'INFY.BO', name: 'Infosys Ltd.', exchange: 'BSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ICICIBANK.BO', name: 'ICICI Bank Ltd.', exchange: 'BSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'BAJFINANCE.BO', name: 'Bajaj Finance Ltd.', exchange: 'BSE', sector: 'NBFC', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'MARUTI.BO', name: 'Maruti Suzuki India Ltd.', exchange: 'BSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'SUNPHARMA.BO', name: 'Sun Pharmaceutical', exchange: 'BSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TATASTEEL.BO', name: 'Tata Steel Ltd.', exchange: 'BSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'LT.BO', name: 'Larsen & Toubro Ltd.', exchange: 'BSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'WIPRO.BO', name: 'Wipro Ltd.', exchange: 'BSE', sector: 'IT', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'SBIN.BO', name: 'State Bank of India', exchange: 'BSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'BHARTIARTL.BO', name: 'Bharti Airtel Ltd.', exchange: 'BSE', sector: 'Telecom', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ITC.BO', name: 'ITC Ltd.', exchange: 'BSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'HINDUNILVR.BO', name: 'Hindustan Unilever Ltd.', exchange: 'BSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'COALINDIA.BO', name: 'Coal India Ltd.', exchange: 'BSE', sector: 'Metal', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TATAMOTORS.BO', name: 'Tata Motors Ltd.', exchange: 'BSE', sector: 'Automobile', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ONGC.BO', name: 'Oil & Natural Gas Corp.', exchange: 'BSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'DRREDDY.BO', name: 'Dr. Reddy\'s Laboratories', exchange: 'BSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'TITAN.BO', name: 'Titan Company Ltd.', exchange: 'BSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ASIANPAINT.BO', name: 'Asian Paints Ltd.', exchange: 'BSE', sector: 'FMCG', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'NTPC.BO', name: 'NTPC Ltd.', exchange: 'BSE', sector: 'Energy', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'AXISBANK.BO', name: 'Axis Bank Ltd.', exchange: 'BSE', sector: 'Banking', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'CIPLA.BO', name: 'Cipla Ltd.', exchange: 'BSE', sector: 'Pharma', capCategory: 'Large Cap', assetType: 'Equity' },
    { symbol: 'ULTRACEMCO.BO', name: 'UltraTech Cement Ltd.', exchange: 'BSE', sector: 'Infrastructure', capCategory: 'Large Cap', assetType: 'Equity' },
    // ── GOLD / SILVER ETFs ───────────────────────────────────
    { symbol: 'GOLDBEES.NS', name: 'Nippon India Gold BeES ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Large Cap', assetType: 'Gold ETF' },
    { symbol: 'GOLDIETF.NS', name: 'ICICI Prudential Gold ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Large Cap', assetType: 'Gold ETF' },
    { symbol: 'HDFCGOLD.NS', name: 'HDFC Gold ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Large Cap', assetType: 'Gold ETF' },
    { symbol: 'AXISGOLD.NS', name: 'Axis Gold ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Large Cap', assetType: 'Gold ETF' },
    { symbol: 'SBIGOLD.NS', name: 'SBI Gold ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Large Cap', assetType: 'Gold ETF' },
    { symbol: 'SILVERBEES.NS', name: 'Nippon India Silver BeES ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Mid Cap', assetType: 'Silver ETF' },
    { symbol: 'SILVERETF.NS', name: 'ICICI Prudential Silver ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Mid Cap', assetType: 'Silver ETF' },
    { symbol: 'HDFC_SILVER.NS', name: 'HDFC Silver ETF', exchange: 'NSE', sector: 'ETF', capCategory: 'Mid Cap', assetType: 'Silver ETF' },
    // ── INDICES (for chart/benchmark navigation) ─────────────
    { symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^BSESN', name: 'BSE SENSEX', exchange: 'BSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^NSEBANK', name: 'NIFTY Bank', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXIT', name: 'NIFTY IT Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXPHARMA', name: 'NIFTY Pharma Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXFMCG', name: 'NIFTY FMCG Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXAUTO', name: 'NIFTY Auto Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXMETAL', name: 'NIFTY Metal Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXENERGY', name: 'NIFTY Energy Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXINFRA', name: 'NIFTY Infrastructure Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXPSU', name: 'NIFTY PSU Bank Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
    { symbol: '^CNXREALTY', name: 'NIFTY Realty Index', exchange: 'NSE', sector: 'Index', capCategory: 'Large Cap', assetType: 'Index' },
];
/* ─────────────────────────────────────────────────────────
   Constants for filters
───────────────────────────────────────────────────────── */
export const ALL_SECTORS = [
    'Banking', 'IT', 'Pharma', 'FMCG', 'Energy', 'Metal',
    'Automobile', 'Telecom', 'Infrastructure', 'PSU', 'Realty', 'NBFC', 'ETF', 'Index',
];
export const ALL_CAP_CATEGORIES = ['Large Cap', 'Mid Cap', 'Small Cap'];
export const ALL_EXCHANGES = ['NSE', 'BSE'];
export const ALL_ASSET_TYPES = ['Equity', 'Gold ETF', 'Silver ETF', 'Index'];
/** Returns sector → count map for the sector overview card */
export function getSectorCounts() {
    return INDIAN_STOCKS.reduce((acc, s) => {
        if (s.assetType === 'Index' || s.assetType === 'Gold ETF' || s.assetType === 'Silver ETF')
            return acc;
        acc[s.sector] = (acc[s.sector] ?? 0) + 1;
        return acc;
    }, {});
}
