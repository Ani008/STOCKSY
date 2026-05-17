import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import useMarketData from "../hooks/useMarketData";
import useHistoricalData from "../hooks/useHistoricalData";
import ChartView from "../components/ChartView";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const RANGES = ["1D", "1W", "1M", "3M", "1Y"];

const formatPrice = (ltp) =>
  ltp != null ? `₹${Number(ltp).toLocaleString("en-IN")}` : "—";

const calcChange = (ltp, cp) => {
  if (!ltp || !cp || cp === 0)
    return { label: "—", isPositive: true, value: 0, diff: 0 };
  const pct = ((ltp - cp) / cp) * 100;
  const diff = (ltp - cp).toFixed(2);
  return {
    label: `${Math.abs(pct).toFixed(2)}% ${pct >= 0 ? "▲" : "▼"}`,
    isPositive: pct >= 0,
    value: pct,
    diff,
  };
};

const StockDetailPage = ({ navigation, route }) => {
  const {
    instrumentKey,
    symbol,
    name,
    sector = "Equity",
    domain,
  } = route.params;

  const [activeRange, setActiveRange] = useState("1M");

  const { prices, isConnected } = useMarketData();
  const live = prices[instrumentKey];
  const ltp = live?.ltp ?? null;
  const cp = live?.cp ?? null;
  const {
    label: changeLabel,
    isPositive,
    value: changePct,
    diff,
  } = calcChange(ltp, cp);

  const { candles, loading: chartLoading } = useHistoricalData(
    instrumentKey,
    activeRange,
  );

  const accentColor = isPositive ? "#10B981" : "#EF4444";
  const accentBg = isPositive
    ? "rgba(16,185,129,0.12)"
    : "rgba(239,68,68,0.12)";

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{symbol}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Company row ─────────────────────────────────────────────────── */}
        <View style={styles.companyRow}>
          {/* Logo */}
          <View style={styles.logoBox}>
            {domain ? (
              <Image
                source={{
                  uri: `https://img.logo.dev/${domain}?token=pk_Bym4BAakTJudMK4MGnfpnw`,
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.logoFallback}>{symbol?.slice(0, 2)}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>{name}</Text>
            <Text style={styles.sectorLabel}>{sector} · NSE</Text>
          </View>
        </View>

        {/* ── Price + change badge ─────────────────────────────────────────── */}
        <View style={styles.priceRow}>
          <Text style={styles.ltp}>{formatPrice(ltp)}</Text>
          <View style={[styles.changeBadge, { backgroundColor: accentBg }]}>
            <Text style={[styles.changeBadgeText, { color: accentColor }]}>
              {changeLabel}
            </Text>
          </View>
        </View>

        {/* ── Chart card ──────────────────────────────────────────────────── */}
        <View style={styles.chartCard}>
          {/* Chart fills the card */}
          <ChartView
            candles={candles}
            livePrice={ltp}
            isPositive={isPositive}
            loading={chartLoading}
            height={200}
          />

          {/* Range tabs inside the card at the bottom */}
          <View style={styles.rangeRow}>
            {RANGES.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setActiveRange(r)}
                style={[
                  styles.rangeTab,
                  activeRange === r && { backgroundColor: accentColor },
                ]}
              >
                <Text
                  style={[
                    styles.rangeLabel,
                    activeRange === r && styles.rangeLabelActive,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatPill
            label="Open"
            value={
              candles.length > 0
                ? formatPrice(candles[candles.length - 1]?.open)
                : "—"
            }
          />
          <StatPill
            label="High"
            value={
              candles.length > 0
                ? formatPrice(candles[candles.length - 1]?.high)
                : "—"
            }
            color="#10B981"
          />
          <StatPill
            label="Low"
            value={
              candles.length > 0
                ? formatPrice(candles[candles.length - 1]?.low)
                : "—"
            }
            color="#EF4444"
          />
          <StatPill label="Close" value={formatPrice(cp)} />
        </View>

        {/* ── About card ──────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>

          <AboutRow label="Symbol" value={symbol} />
          <AboutRow label="Sector" value={sector} />
          <AboutRow label="Exchange" value="NSE" />
          <AboutRow
            label="Day Change"
            value={`${isPositive ? "+" : ""}${diff !== 0 ? `₹${Math.abs(diff)}` : "—"}`}
            valueColor={accentColor}
          />
          <AboutRow
            label="Change %"
            value={`${isPositive ? "+" : "-"}${Math.abs(changePct).toFixed(2)}%`}
            valueColor={accentColor}
            last
          />
        </View>

        {/* credit */}
        <Text style={styles.credit}>Charts by TradingView</Text>
      </ScrollView>

      {/* ── Action bar ──────────────────────────────────────────────────────── */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.sellBtn} onPress={() => {}}>
          <Text style={styles.sellText}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => {
            navigation.navigate("BuyOrder", {
              instrumentKey,
              symbol,
              name,
              sector,
              orderType: "BUY", // or "SELL"
            });
          }}
        >
          <Text style={styles.buyText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatPill = ({ label, value, color = "#1E293B" }) => (
  <View style={styles.statPill}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const AboutRow = ({ label, value, valueColor = "#1E293B", last = false }) => (
  <>
    <View style={styles.aboutRow}>
      <Text style={styles.aboutLabel}>{label}</Text>
      <Text style={[styles.aboutValue, { color: valueColor }]}>{value}</Text>
    </View>
    {!last && <View style={styles.divider} />}
  </>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    marginTop: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.3,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 12, fontWeight: "600" },

  scroll: { paddingBottom: 110 },

  // Company row
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: { width: 36, height: 36, borderRadius: 8 },
  logoFallback: { fontSize: 15, fontWeight: "700", color: "#3B82F6" },
  companyName: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  sectorLabel: { fontSize: 12, color: "#94A3B8", marginTop: 2 },

  // Price
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  ltp: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  changeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // Chart card — white card like the reference image
  chartCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: "hidden",
  },

  // Range tabs — inside card at bottom
  rangeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  rangeTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  rangeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  rangeLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },

  // About card
  card: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  divider: { height: 1, backgroundColor: "#F8FAFC" },
  aboutLabel: { fontSize: 13, color: "#94A3B8" },
  aboutValue: { fontSize: 13, fontWeight: "600", color: "#1E293B" },

  // Credit
  credit: {
    textAlign: "center",
    fontSize: 10,
    color: "#CBD5E1",
    marginBottom: 4,
  },

  // Action bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  sellBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  sellText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
  buyBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  buyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default StockDetailPage;
