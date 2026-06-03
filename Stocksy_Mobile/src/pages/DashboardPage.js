import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import Button from "../components/Button";
import StockCard from "../components/StockCard";
import WatchlistItem from "../components/WatchlistItem";
import MiniHoldingCard from "../components/MiniHoldingCard";
import { usePortfolio } from "../hooks/usePortfolio";
import Search from "./SearchPage";

// ─── Live market data hook ────────────────────────────────────────────────────
import useMarketData from "../hooks/useMarketData";

// ─── Sample data ─────────────────────────────────────────────────────────────
const TOP_STOCKS = [
  {
    id: "1",
    key: "NSE_EQ|INE205A01025",
    ticker: "VEDL",
    name: "Vedanta",
    domain: "vedanta-zincinternational.com",
  },
  {
    id: "2",
    key: "NSE_EQ|INE263A01024",
    ticker: "BEL",
    name: "Bharat Electronics",
    domain: "bel-india.in",
  },
  {
    id: "3",
    key: "NSE_EQ|INE053F01010",
    ticker: "IRFC",
    name: "IRFC",
    domain: "irfc.co.in",
  },
  {
    id: "4",
    key: "NSE_EQ|INE040H01021",
    ticker: "SUZLON",
    name: "Suzlon Energy",
    domain: "suzlon.de",
  },
];

const LARGE_CAP_KEYS = [
  {
    key: "NSE_EQ|INE002A01018",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    domain: "ril.com",
  },
  {
    key: "NSE_EQ|INE040A01034",
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    domain: "hdfcbank.com",
  },
  {
    key: "NSE_EQ|INE467B01029",
    symbol: "TCS",
    name: "Tata Consultancy Services",
    domain: "tcs.com",
  },
  {
    key: "NSE_EQ|INE397D01024",
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    domain: "airtel.in",
  },
  {
    key: "NSE_EQ|INE062A01020",
    symbol: "SBIN",
    name: "State Bank of India",
    domain: "sbi.co.in",
  },
  {
    key: "NSE_EQ|INE090A01021",
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    domain: "icicibank.com",
  },
  {
    key: "NSE_EQ|INE009A01021",
    symbol: "INFY",
    name: "Infosys Ltd",
    domain: "infosys.com",
  },
];

const MID_CAP_KEYS = [
  {
    key: "NSE_EQ|INE860A01027",
    symbol: "HCLTECH",
    name: "HCL Technologies Ltd",
    domain: "hcltech.com",
  },
  {
    key: "NSE_EQ|INE669C01036",
    symbol: "TECHM",
    name: "Tech Mahindra Ltd",
    domain: "techmahindra.com",
  },
  {
    key: "NSE_EQ|INE081A01020",
    symbol: "TATASTEEL",
    name: "Tata Steel Ltd",
    domain: "tatasteel.com",
  },
  {
    key: "NSE_EQ|INE019A01038",
    symbol: "JSWSTEEL",
    name: "JSW Steel Ltd",
    domain: "jsw.in",
  },
  {
    key: "NSE_EQ|INE044A01036",
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical",
    domain: "sunpharma.com",
  },
];

const SMALL_CAP_KEYS = [
  {
    key: "NSE_EQ|INE059A01026",
    symbol: "CIPLA",
    name: "Cipla Ltd",
    domain: "cipla.com",
  },
  {
    key: "NSE_EQ|INE522F01014",
    symbol: "COALINDIA",
    name: "Coal India Ltd",
    domain: "coalindia.in",
  },
  {
    key: "NSE_EQ|INE016A01026",
    symbol: "DABUR",
    name: "Dabur India Ltd",
    domain: "dabur.com",
  },
  {
    key: "NSE_EQ|INE216A01030",
    symbol: "BRITANNIA",
    name: "Britannia Industries",
    domain: "britannia.co.in",
  },
];

// constants/companyDomains.js
const COMPANY_DOMAINS = {
  VEDL: "vedanta-zincinternational.com",
  BEL: "bel-india.in",
  IRFC: "irfc.co.in",
  SUZLON: "suzlon.de",
  RELIANCE: "ril.com",
  TCS: "tcs.com",
  HDFCBANK: "hdfcbank.com",
  INFY: "infosys.com",
  SBIN: "sbi.co.in",
  ICICIBANK: "icicibank.com",
  BHARTIARTL: "airtel.in",
  HCLTECH: "hcltech.com",
  TECHM: "techmahindra.com",
  TATASTEEL: "tatasteel.com",
  JSWSTEEL: "jsw.in",
  SUNPHARMA: "sunpharma.com",
  CIPLA: "cipla.com",
  COALINDIA: "coalindia.in",
  DABUR: "dabur.com",
  BRITANNIA: "britannia.co.in",
};

// ─── Helper: compute % change from close price ───────────────────────────────
const calcChange = (ltp, cp) => {
  if (!ltp || !cp || cp === 0) return null;
  const pct = ((ltp - cp) / cp) * 100;
  const sign = pct >= 0 ? "▲" : "▼";
  return {
    label: `${sign} ${Math.abs(pct).toFixed(2)}%`,
    isPositive: pct >= 0,
  };
};

const DashboardPage = ({ navigation }) => {
  // ── Live prices from WebSocket ──────────────────────────────────────────────
  const { prices, isConnected } = useMarketData();
  const { positions, totals, loading } = usePortfolio(prices);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");

      if (stored) {
        setUser(JSON.parse(stored));
      }
    };

    loadUser();
  }, []);

  // ── Renders a WatchlistItem with live price from WebSocket ──────────────────
  const renderLiveStock = (item) => {
    const live = prices[item.key];
    const change = live ? calcChange(live.ltp, live.cp) : null;
    return (
      <WatchlistItem
        key={item.key}
        ticker={item.symbol}
        name={item.name}
        price={live?.ltp ? `₹${live.ltp.toLocaleString("en-IN")}` : "—"}
        change={change?.label}
        isPositive={change?.isPositive ?? true}
        logoUrl={`https://img.logo.dev/${item.domain}?token=pk_Bym4BAakTJudMK4MGnfpnw`}
        onPress={() =>
          navigation.navigate("StockDetail", {
            // ← add this
            instrumentKey: item.key,
            symbol: item.symbol,
            name: item.name,
            sector: item.sector ?? "Equity",
            domain: item.domain,
          })
        }
      />
    );
  };

  const renderTopStock = (item) => {
    const live = prices[item.key];
    const change = live ? calcChange(live.ltp, live.cp) : null;

    return (
      <StockCard
        key={item.key}
        ticker={item.ticker}
        name={item.name}
        logoUrl={`https://img.logo.dev/${item.domain}?token=pk_Bym4BAakTJudMK4MGnfpnw`}
        price={live?.ltp ? `₹${live.ltp.toLocaleString("en-IN")}` : "—"}
        change={change?.label}
        isPositive={change?.isPositive ?? true}
        onPress={() =>
          navigation.navigate("StockDetail", {
            instrumentKey: item.key,
            symbol: item.ticker,
            name: item.name,
            sector: item.sector ?? "Equity",
            domain: item.domain,
          })
        }
      />
    );
  };

  // Pull Nifty 50 data — key matches what Python saves to Redis (Section 9.2)
  const nifty = prices["NSE_INDEX|Nifty 50"];
  const niftyLtp = nifty?.ltp;
  const niftyChange = nifty ? calcChange(nifty.ltp, nifty.cp) : null;

  const bankNifty = prices["NSE_INDEX|Nifty Bank"];
  const bankNiftyLtp = bankNifty?.ltp;
  const bankNiftyChange = bankNifty
    ? calcChange(bankNifty.ltp, bankNifty.cp)
    : null;

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      navigation.replace("Login");
    } catch (_) {}
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: handleLogout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.headerBackground} />

        {/* ── Top Header ──────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Good Morning!</Text>

            <Text style={styles.userName}>
              Hi, {user?.username || "Trader"}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Search")}
              style={styles.iconButton}
            >
              <Ionicons name="search-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              name="logout"
              onPress={confirmLogout}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons name="logout" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Connection Status ─────────────────────────────────────────────── */}
        <View style={styles.wsDot}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isConnected ? "#34D399" : "#EF4444" },
            ]}
          />
          <Text style={styles.wsLabel}>
            {isConnected ? "Live Market Data" : "Disconnected"}
          </Text>
        </View>

        {/* ── Search Button (duplicate for easy access) ─────────────────────────        
            >
              <Ionicons name="search-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Main Asset Card ─────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Portfolio")}
          style={styles.mainCard}
        >
          <View>
            <Text style={styles.assetLabel}>Total Assets</Text>
            <View style={styles.priceRow}>
              <Text style={styles.totalAmount}>
                ₹{totals.portfolioValue?.toLocaleString("en-IN") ?? "0"}
              </Text>

              <View style={styles.changeChip}>
                <Text style={styles.totalChange}>▲ 3.87% (24h)</Text>
              </View>
            </View>
            <View style={styles.miniCardsRow}>
              {positions?.length > 0 ? (
                positions
                  .slice(0, 2)
                  .map((position) => (
                    <MiniHoldingCard
                      key={position.instrument_key}
                      ticker={position.symbol}
                      name={`₹${position.ltp?.toLocaleString("en-IN")}`}
                      change={`${position.unrealisedPct?.toFixed(2)}%`}
                      isPositive={position.unrealisedPnl >= 0}
                      logoUrl={`https://img.logo.dev/${
                        COMPANY_DOMAINS[position.symbol]
                      }?token=pk_Bym4BAakTJudMK4MGnfpnw`}
                    />
                  ))
              ) : (
                <Text>No Holdings Yet</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Index Section — LIVE DATA ────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Index</Text>
        </View>

        <View style={styles.miniCardsRow}>
          <MiniHoldingCard
            ticker="NIFTY 50"
            name={
              niftyLtp ? `₹${niftyLtp.toLocaleString("en-IN")}` : "Loading..."
            }
            change={niftyChange?.label ?? undefined}
            isPositive={niftyChange?.isPositive ?? true}
            logoUrl="https://img.logo.dev/nseindia.com?token=pk_Bym4BAakTJudMK4MGnfpnw"
          />
          <MiniHoldingCard
            ticker="BANK NIFTY"
            name={
              bankNiftyLtp
                ? `₹${bankNiftyLtp.toLocaleString("en-IN")}`
                : "Loading..."
            }
            change={bankNiftyChange?.label ?? undefined}
            isPositive={bankNiftyChange?.isPositive ?? true}
            logoUrl="https://img.logo.dev/nseindia.com?token=pk_Bym4BAakTJudMK4MGnfpnw"
          />
        </View>

        {/* ── Top Stocks ──────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Stocks</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {TOP_STOCKS.map(renderTopStock)}
        </ScrollView>

        {/* ── Large Cap ─────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Large Cap Stocks</Text>
        </View>
        {LARGE_CAP_KEYS.map(renderLiveStock)}

        {/* ── Mid Cap ───────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mid Cap Stocks</Text>
        </View>
        {MID_CAP_KEYS.map(renderLiveStock)}

        {/* ── Small Cap ─────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Small Cap Stocks</Text>
        </View>
        {SMALL_CAP_KEYS.map(renderLiveStock)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#3B82F6",
  },

  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300, // instead of 240
    backgroundColor: "#3B82F6",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
    backgroundColor: "#F8FAFC",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  greetingText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  userName: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 2 },
  headerIcons: { flexDirection: "row", gap: 12, alignItems: "center" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
  },

  // ── Live indicator ──────────────────────────────────────────────────────────
  wsDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  wsLabel: { color: "white", fontSize: 11, fontWeight: "600" },

  mainCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 28,
  },
  assetLabel: { color: "#64748B", fontSize: 13, marginBottom: 6 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  totalAmount: { fontSize: 28, fontWeight: "bold", color: "#1E293B" },
  changeChip: {
    marginLeft: "auto",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  totalChange: { color: "#10B981", fontSize: 13, fontWeight: "700" },

  miniCardsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },

  horizontalScroll: { gap: 14, paddingRight: 4, marginBottom: 28 },
});

export default DashboardPage;
