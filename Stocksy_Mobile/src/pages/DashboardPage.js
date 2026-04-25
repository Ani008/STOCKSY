import React from "react";
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

// ─── Reusable components (from src/components/) ───────────────────────────────
// Button is from the existing src/components/Button.js (docs: safe to reuse, add variants)
import Button from "../components/Button";

// ─── New reusable components (add to src/components/) ────────────────────────
import StockCard from "../components/StockCard";
import WatchlistItem from "../components/WatchlistItem";
import MiniHoldingCard from "../components/MiniHoldingCard";

// ─── Sample data (wire up to API via services/stockService.js) ───────────────
const TOP_STOCKS = [
  {
    id: "1",
    ticker: "TSLA",
    name: "Tesla, Inc.",
    price: "$131.46",
    change: "▲ 2.13%",
    isPositive: true,
    iconName: "logo-tableau",
    iconColor: "#E31937",
  },
  {
    id: "2",
    ticker: "MSFT",
    name: "Microsoft, Co.",
    price: "$120.32",
    change: "▲ 0.84%",
    isPositive: true,
    iconName: "logo-windows",
    iconColor: "#00A4EF",
  },
  {
    id: "3",
    ticker: "GOOGL",
    name: "Alphabet, Inc.",
    price: "$175.10",
    change: "▼ 0.42%",
    isPositive: false,
    iconName: "search-outline",
    iconColor: "#EA4335",
  },
];

const LARGE_CAP = [
  {
    id: "1",
    ticker: "RELIANCE",
    name: "Reliance Industries Ltd.",
    price: "$716.21",
    change: "▲ 1.33%",
    isPositive: true,
    domain: "ril.com",
  },
  {
    id: "2",
    ticker: "HDFCBANK",
    name: "HDFC Bank",
    price: "$186.40",
    change: "▼ 0.57%",
    isPositive: false,
    domain: "hdfcbank.com",
  },
  {
    id: "3",
    ticker: "TCS",
    name: "Tata Consultancy Services",
    price: "$350.00",
    change: "▲ 0.91%",
    isPositive: true,
    domain: "tcs.com",
  },
  {
    id: "4",
    ticker: "BHARTIARTL",
    name: "Bharti Airtel Ltd.",
    price: "$186.40",
    change: "▼ 0.57%",
    isPositive: false,
    domain: "airtel.in",
  },
  {
    id: "5",
    ticker: "SBIN",
    name: "State Bank of India",
    price: "$186.40",
    change: "▼ 0.57%",
    isPositive: false,
    domain: "sbi.co.in",
  },
];

const MID_CAP = [
  {
    id: "1",
    ticker: "VOLTAS",
    name: "Voltas Ltd.",
    price: "$120.00",
    change: "▲ 1.10%",
    isPositive: true,
    domain: "voltas.com",
  },
  {
    id: "2",
    ticker: "CROMPTON",
    name: "Crompton Greaves",
    price: "$98.00",
    change: "▼ 0.30%",
    isPositive: false,
    domain: "crompton.co.in",
  },
  // ...3 more
];

const SMALL_CAP = [
  {
    id: "1",
    ticker: "IRFC",
    name: "Indian Railway Finance",
    price: "$45.00",
    change: "▲ 2.10%",
    isPositive: true,
    domain: "irfc.nic.in",
  },
  {
    id: "2",
    ticker: "RVNL",
    name: "Rail Vikas Nigam Ltd.",
    price: "$62.00",
    change: "▼ 0.80%",
    isPositive: false,
    domain: "rvnl.org",
  },
  // ...3 more
];

const DashboardPage = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      // authService.logout() — keep in sync with docs (POST /auth/logout)
      navigation.replace("Login");
    } catch (_) {
      // silently fails per authService docs
    }
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
        {/* Blue header background strip */}
        <View style={styles.headerBackground} />
        {/* ── Top Header ────────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Good Morning!</Text>
            <Text style={styles.userName}>Hi, Jessica H</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={confirmLogout} style={styles.iconButton}>
              <MaterialCommunityIcons name="logout" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <View>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="white"
                />
                {/* Notification badge */}
                <View style={styles.badge} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Main Asset Card ───────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Portfolio")}
          style={styles.mainCard}
        >
          <View>
            <Text style={styles.assetLabel}>Total Assets</Text>
            <View style={styles.priceRow}>
              <Text style={styles.totalAmount}>$27,170.01</Text>

              <Ionicons
                name="eye-outline"
                size={19}
                color="#94A3B8"
                style={{ marginLeft: 8 }}
              />
              <View style={styles.changeChip}>
                <Text style={styles.totalChange}>▲ 3.87% (24h)</Text>
              </View>
            </View>
            {/* Mini holding chips — uses new MiniHoldingCard component */}
            <View style={styles.miniCardsRow}>
              <MiniHoldingCard
                ticker="Amazon"
                name="Amazon, Inc"
                change="▲ 1.76%"
                isPositive
                iconName="logo-amazon"
                iconColor="#FF9900"
              />
              <MiniHoldingCard
                ticker="Apple"
                name="Apple, Inc"
                iconName="logo-apple"
                iconColor="#1E293B"
              />
            </View>
            {/* Action buttons — reuses existing Button component (docs: safe to reuse) */}
            <View style={styles.actionRow}>
              <Button
                title="Deposit"
                onPress={() => {}}
                variant="primary"
                style={styles.actionBtn}
              />
              <Button
                title="Withdraw"
                onPress={() => {}}
                variant="outline"
                style={styles.actionBtn}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Top Stocks ────────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Stocks</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal scrollable stock cards — uses new StockCard component */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {TOP_STOCKS.map((stock) => (
            <StockCard
              key={stock.id}
              ticker={stock.ticker}
              name={stock.name}
              price={stock.price}
              change={stock.change}
              isPositive={stock.isPositive}
              iconName={stock.iconName}
              iconColor={stock.iconColor}
            />
          ))}
        </ScrollView>

        {/* ── Watchlist ─────────────────────────────────────────────────────── */}
        {/* ── Large Cap ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Large Cap Stocks</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {LARGE_CAP.map((item) => (
          <WatchlistItem
            key={item.id}
            ticker={item.ticker}
            name={item.name}
            price={item.price}
            change={item.change}
            isPositive={item.isPositive}
            logoUrl={`https://img.logo.dev/${item.domain}?token=pk_Bym4BAakTJudMK4MGnfpnw`}
            onPress={() => {}}
          />
        ))}

        {/* ── Mid Cap ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mid Cap Stocks</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {MID_CAP.map((item) => (
          <WatchlistItem
            key={item.id}
            ticker={item.ticker}
            name={item.name}
            price={item.price}
            change={item.change}
            isPositive={item.isPositive}
            logoUrl={`https://img.logo.dev/${item.domain}?token=pk_Bym4BAakTJudMK4MGnfpnw`}
            onPress={() => {}}
          />
        ))}

        {/* ── Small Cap ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Small Cap Stocks</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {SMALL_CAP.map((item) => (
          <WatchlistItem
            key={item.id}
            ticker={item.ticker}
            name={item.name}
            price={item.price}
            change={item.change}
            isPositive={item.isPositive}
            logoUrl={`https://img.logo.dev/${item.domain}?token=pk_Bym4BAakTJudMK4MGnfpnw`}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: "#3B82F6",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    marginTop: 48,
  },
  greetingText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  userName: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 2 },
  headerIcons: { flexDirection: "row", gap: 12 },
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

  // ── Main Asset Card ──────────────────────────────────────────────────────────
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

  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1 },

  // ── Section Header ───────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 24, // ← add this
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  seeAll: { color: "#3B82F6", fontWeight: "600", fontSize: 14 },

  // ── Stocks horizontal list ───────────────────────────────────────────────────
  horizontalScroll: { gap: 14, paddingRight: 4, marginBottom: 28 },
});

export default DashboardPage;
