import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import { WebView } from "react-native-webview";

import useMarketData from "../hooks/useMarketData";
import useHistoricalData from "../hooks/useHistoricalData";
import ChartView from "../components/ChartView";
import useFundamentals from "../hooks/useFundamentals";

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
  const {
    fundamentals,
    loading: fundamentalsLoading,
    error,
  } = useFundamentals(symbol);
  const live = prices[instrumentKey];
  const ltp = live?.ltp ?? null;
  const cp = live?.cp ?? null;
  const isLive = live?.isLive ?? false;
  const lastUpdated = live?.lastUpdated ?? null;
  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated * 1000).toLocaleString("en-IN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
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

  const [showFundamentals, setShowFundamentals] = useState(true);
  const [chartExpanded, setChartExpanded] = useState(false);

  const [showDetails, setShowDetails] = useState(true);
  const [financialType, setFinancialType] = useState("quarterly");
  const financialData = fundamentals?.financials?.[financialType] || [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedData = financialData[selectedIndex];
  const profile = fundamentals?.profile;

  const shareholding = fundamentals?.shareholding?.quarters || [];

  const [selectedHoldingIndex, setSelectedHoldingIndex] = useState(0);

  const selectedHolding = shareholding[selectedHoldingIndex];

  useEffect(() => {
    if (financialData.length > 0) {
      setSelectedIndex(financialData.length - 1);
    }
  }, [financialType, financialData]);

  const revenueData = financialData.map((item, index) => ({
    value: item.revenue,

    label: item.period,

    frontColor: index === selectedIndex ? "#3B82F6" : "rgba(59,130,246,0.25)",

    onPress: () => setSelectedIndex(index),

    labelTextStyle: {
      color: index === selectedIndex ? "#1E293B" : "#94A3B8",

      fontWeight: index === selectedIndex ? "700" : "500",

      fontSize: 11,
    },
  }));

  const profitData = financialData.map((item, index) => ({
    value: item.profit,

    frontColor: index === selectedIndex ? "#10B981" : "rgba(16,185,129,0.25)",

    onPress: () => setSelectedIndex(index),
  }));

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

          <Text
            style={[
              styles.priceChange,
              {
                color: accentColor,
              },
            ]}
          >
            {`${changePct >= 0 ? "+" : ""}₹${Math.abs(diff)} (${changeLabel})`}
          </Text>
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

          {/* ── Expand button — bottom-right corner of chart card ── */}
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setChartExpanded(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="expand-outline" size={15} color="#64748B" />
          </TouchableOpacity>

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

        {/* ── TradingView Advanced Chart Modal ────────────────────────────── */}
        <TradingViewModal
          visible={chartExpanded}
          symbol={symbol}
          name={name}
          ltp={ltp}
          changeLabel={changeLabel}
          isPositive={isPositive}
          accentColor={accentColor}
          accentBg={accentBg}
          onClose={() => setChartExpanded(false)}
        />

        {/* ── Details Dropdown ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setShowDetails(!showDetails)}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="black"
              />

              <Text style={styles.cardTitle}>Details</Text>
            </View>

            <Ionicons
              name={showDetails ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {showDetails && (
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
          )}
        </View>

        {/* ── Fundamentals Dropdown ───────────────────────────────────── */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setShowFundamentals(!showFundamentals)}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="black"
              />

              <Text style={styles.cardTitle}>Fundamentals</Text>
            </View>

            <Ionicons
              name={showFundamentals ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>
          {showFundamentals && fundamentalsLoading && (
            <Text style={{ marginTop: 12 }}>Loading fundamentals...</Text>
          )}
          {showFundamentals && error && (
            <Text style={{ color: "red", marginTop: 12 }}>{error}</Text>
          )}
          {showFundamentals &&
            !fundamentalsLoading &&
            fundamentals?.metrics && (
              <View style={styles.fundamentalsGrid}>
                <View style={styles.fundamentalItem}>
                  <Text style={styles.fundamentalLabel}>Market Cap</Text>
                  <Text style={styles.fundamentalValue}>
                    ₹
                    {Number(fundamentals.metrics.market_cap).toLocaleString(
                      "en-IN",
                    )}{" "}
                    Cr
                  </Text>
                </View>

                <View style={styles.fundamentalItem}>
                  <Text style={styles.fundamentalLabel}>ROE</Text>
                  <Text style={styles.fundamentalValue}>
                    {fundamentals.metrics.roe}%
                  </Text>
                </View>

                <View style={styles.fundamentalItem}>
                  <Text style={styles.fundamentalLabel}>P/E Ratio</Text>
                  <Text style={styles.fundamentalValue}>
                    {fundamentals.metrics.pe_ratio}
                  </Text>
                </View>

                <View style={styles.fundamentalItem}>
                  <Text style={styles.fundamentalLabel}>Industry P/E</Text>
                  <Text style={styles.fundamentalValue}>
                    {fundamentals.metrics.industry_pe}
                  </Text>
                </View>

                <View style={styles.fundamentalItem}>
                  <Text style={styles.fundamentalLabel}>Dividend Yield</Text>
                  <Text style={styles.fundamentalValue}>
                    {fundamentals.metrics.dividend_yield}%
                  </Text>
                </View>

                <View style={styles.fundamentalItem}>
                  <Text style={styles.fundamentalLabel}>Book Value</Text>
                  <Text style={styles.fundamentalValue}>
                    {fundamentals.metrics.book_value}
                  </Text>
                </View>

                <View style={styles.fundamentalItem}>
                  <Text style={styles.fundamentalLabel}>Debt to Equity</Text>
                  <Text style={styles.fundamentalValue}>
                    {fundamentals.metrics.debt_to_equity}
                  </Text>
                </View>
              </View>
            )}
        </View>

        {/* ── Financial Performance ───────────────────────── */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="black"
            />

            <Text style={styles.cardTitle}>Financial Performance</Text>
          </View>
          {selectedData && (
            <View style={styles.financialStatsRow}>
              {/* Revenue */}
              <View>
                <Text style={styles.financialStatLabel}>REVENUE (CR)</Text>

                <Text style={styles.financialStatValue}>
                  ₹
                  {selectedData?.revenue != null
                    ? Number(selectedData.revenue).toLocaleString("en-IN")
                    : "--"}
                </Text>
              </View>

              {/* Profit */}
              <View>
                <Text style={styles.financialStatLabel}>PROFIT (CR)</Text>

                <Text style={[styles.financialStatValue, { color: "#10B981" }]}>
                  ₹
                  {selectedData?.profit != null
                    ? Number(selectedData.profit).toLocaleString("en-IN")
                    : "--"}
                </Text>
              </View>
            </View>
          )}

          {/* Toggle Buttons */}
          <View style={styles.financialToggleRow}>
            <TouchableOpacity
              onPress={() => setFinancialType("quarterly")}
              style={[
                styles.financialToggleBtn,
                financialType === "quarterly" &&
                  styles.financialToggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.financialToggleText,
                  financialType === "quarterly" &&
                    styles.financialToggleTextActive,
                ]}
              >
                Quarterly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFinancialType("yearly")}
              style={[
                styles.financialToggleBtn,
                financialType === "yearly" && styles.financialToggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.financialToggleText,
                  financialType === "yearly" &&
                    styles.financialToggleTextActive,
                ]}
              >
                Yearly
              </Text>
            </TouchableOpacity>
          </View>

          <BarChart
            data={revenueData}
            secondaryData={profitData}
            barWidth={20}
            spacing={38}
            roundedTop
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            noOfSections={4}
            disableScroll
            isAnimated
            initialSpacing={16}
            endSpacing={16}
            xAxisLabelTextStyle={{
              marginTop: 12,
            }}
            yAxisTextStyle={{
              color: "#94A3B8",
              fontSize: 10,
            }}
          />
        </View>

        {/* ── About Company ───────────────────────── */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="black"
            />

            <Text style={styles.cardTitle}>About Company</Text>
          </View>

          {/* Description */}
          <Text style={styles.companyDescription}>
            {profile?.description || "No company description available."}
          </Text>

          <View style={styles.divider} />

          <AboutRow label="CEO" value={profile?.ceo || "--"} />

          <AboutRow label="Founded" value={profile?.founded || "--"} />

          <AboutRow label="NSE Symbol" value={profile?.nse_symbol || symbol} />

          <AboutRow label="Industry" value={profile?.industry || "--"} />
        </View>

        {/* ── Shareholding Pattern ───────────────────────── */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="black"
            />

            <Text style={styles.cardTitle}>Shareholding Pattern</Text>
          </View>

          {/* Quarter Selector */}
          <View style={styles.holdingQuarterRow}>
            {shareholding.map((item, index) => (
              <TouchableOpacity
                key={item.period}
                onPress={() => setSelectedHoldingIndex(index)}
                style={[
                  styles.holdingQuarterChip,

                  selectedHoldingIndex === index &&
                    styles.holdingQuarterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.holdingQuarterText,

                    selectedHoldingIndex === index &&
                      styles.holdingQuarterTextActive,
                  ]}
                >
                  {item.period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bars */}
          {selectedHolding?.data?.map((item) => (
            <View key={item.category} style={styles.shareholdingItem}>
              <View style={styles.shareholdingTopRow}>
                <Text style={styles.shareholdingLabel}>{item.category}</Text>

                <Text style={styles.shareholdingValue}>{item.value}%</Text>
              </View>

              {/* Progress Track */}
              <View style={styles.shareholdingTrack}>
                <View
                  style={[
                    styles.shareholdingBar,
                    {
                      width: `${item.value}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Action bar ──────────────────────────────────────────────────────── */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => {
            navigation.navigate("BuyOrder", {
              instrumentKey,
              symbol,
              name,
              sector,
              orderType: "SELL",
            });
          }}
        >
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
              orderType: "BUY",
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
    paddingBottom: 20,
    gap: 12,
  },
  ltp: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.4,
    lineHeight: 38,
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

  // Expand button — floats at bottom-right inside chartCard above range tabs
  expandBtn: {
    position: "absolute",
    bottom: 54,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  fundamentalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  fundamentalItem: {
    width: "48%",
    marginBottom: 20,
    borderRightWidth: 0.5,
    borderColor: "#E2E8F0",
    paddingRight: 10,
  },

  fundamentalLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },

  fundamentalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  financialToggleRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },

  financialToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  financialToggleBtnActive: {
    backgroundColor: "#FFFFFF",
  },

  financialToggleText: {
    color: "#64748B",
    fontWeight: "600",
  },

  financialToggleTextActive: {
    color: "#1E293B",
    fontWeight: "700",
  },

  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  financialPeriod: {
    fontSize: 13,
    color: "#64748B",
  },

  financialRevenue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "right",
  },

  financialProfit: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "right",
  },

  legendRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 8,
  },

  legendText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  financialStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  financialStatLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },

  financialStatValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
  },

  periodSelectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
  },

  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },

  periodChipText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 12,
  },

  companyDescription: {
    fontSize: 14,
    lineHeight: 24,
    color: "#475569",
    marginBottom: 18,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  holdingQuarterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },

  holdingQuarterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },

  holdingQuarterChipActive: {
    backgroundColor: "rgba(59,130,246,0.12)",
  },

  holdingQuarterText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 12,
  },

  holdingQuarterTextActive: {
    color: "#3B82F6",
    fontWeight: "700",
  },

  shareholdingItem: {
    marginBottom: 24,
  },

  shareholdingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  shareholdingLabel: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },

  shareholdingValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
  },

  shareholdingTrack: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },

  shareholdingBar: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 10,
  },
});

// ── TradingView Advanced Chart Modal ─────────────────────────────────────────
/**
 * Maps your NSE symbol → TradingView ticker format.
 * All NSE equity stocks use "NSE:" prefix.
 * The two indices need special names.
 */
const toTVSymbol = (symbol) => {
  const overrides = {
    "NIFTY 50": "NSE:NIFTY",
    "NIFTY BANK": "NSE:BANKNIFTY",
  };
  return overrides[symbol] ?? `NSE:${symbol}`;
};

const TradingViewModal = ({
  visible,
  symbol,
  name,
  ltp,
  changeLabel,
  isPositive,
  accentColor,
  accentBg,
  onClose,
}) => {
  const tvSymbol = toTVSymbol(symbol);

  // Full TradingView Advanced Chart widget — candlesticks, indicators,
  // drawing tools, volume, all timeframes — exactly what Groww & Zerodha use.
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100vh; background:#131722; overflow:hidden; }
    #tv_chart_container { width:100%; height:100vh; }
  </style>
</head>
<body>
  <div id="tv_chart_container"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
  <script type="text/javascript">
    new TradingView.widget({
      autosize: true,
      symbol: "${tvSymbol}",
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#1E2433",
      enable_publishing: false,
      allow_symbol_change: false,
      container_id: "tv_chart_container",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      show_popup_button: false,
      withdateranges: true,
      hide_side_toolbar: false,
      details: false,
      hotlist: false,
      calendar: false,
    });
  </script>
</body>
</html>`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#131722" />
      <SafeAreaView style={tvStyles.safe}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={tvStyles.header}>
          {/* Symbol + company name */}
          <View style={tvStyles.left}>
            <Text style={tvStyles.symbol}>{symbol}</Text>
            <Text style={tvStyles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>

          {/* Live price + change badge */}
          <View style={tvStyles.centre}>
            <Text style={tvStyles.ltp}>
              {ltp != null ? `₹${Number(ltp).toLocaleString("en-IN")}` : "—"}
            </Text>
            <View style={[tvStyles.badge, { backgroundColor: accentBg }]}>
              <Text style={[tvStyles.badgeText, { color: accentColor }]}>
                {changeLabel}
              </Text>
            </View>
          </View>

          {/* Close */}
          <TouchableOpacity
            style={tvStyles.closeBtn}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* ── TradingView Advanced Chart ──────────────────────────────── */}
        <WebView
          source={{ html }}
          style={{ flex: 1, backgroundColor: "#131722" }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          allowsInlineMediaPlayback
          scrollEnabled={false}
          bounces={false}
          onError={(e) => console.warn("TradingView error:", e.nativeEvent)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const tvStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#131722",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#131722",
    borderBottomWidth: 1,
    borderBottomColor: "#1E2433",
    gap: 8,
  },
  left: {
    flex: 1.2,
  },
  symbol: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -0.3,
  },
  name: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  centre: {
    flex: 1,
    alignItems: "flex-end",
  },
  ltp: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1E2433",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
});

export default StockDetailPage;