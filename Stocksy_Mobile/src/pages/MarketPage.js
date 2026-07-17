import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// Shaped exactly like the future API response so swapping
// to real endpoints later is a one-line change (see bottom).
// ─────────────────────────────────────────────────────────

const MOCK_MARKET_DATA = {
  mood: {
    percentage: 68,
    label: "Market is mostly positive today",
    subtext: "32 of 50 Nifty stocks are up",
  },
  indices: [
    { symbol: "NIFTY 50", value: "24,812", change: 0.62 },
    { symbol: "SENSEX", value: "81,405", change: 0.58 },
    { symbol: "BANK NIFTY", value: "52,190", change: -0.21 },
    { symbol: "FIN NIFTY", value: "23,760", change: 0.34 },
  ],
  gainers: [
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd", change: 4.82 },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", change: 3.91 },
    { symbol: "ADANIENT", name: "Adani Enterprises Ltd", change: 3.2 },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", change: 2.65 },
  ],
  losers: [
    { symbol: "VEDL", name: "Vedanta Ltd", change: -3.44 },
    { symbol: "TATASTEEL", name: "Tata Steel Ltd", change: -2.9 },
    { symbol: "ONGC", name: "Oil & Natural Gas Corp", change: -2.11 },
    { symbol: "COALINDIA", name: "Coal India Ltd", change: -1.78 },
  ],
  // NOTE: needs volume data in the Python/Redis pipeline — backend not ready yet.
  mostActive: [
    { symbol: "RELIANCE", volume: "8.2Cr" },
    { symbol: "SBIN", volume: "6.4Cr" },
    { symbol: "ICICIBANK", volume: "5.9Cr" },
    { symbol: "INFY", volume: "4.7Cr" },
  ],
  // NOTE: needs a stock_view event log table — backend not ready yet.
  // Do NOT randomize this in production, it should be real view counts.
  trending: [
    { symbol: "HCLTECH", views: "2.1k" },
    { symbol: "SUNPHARMA", views: "1.8k" },
    { symbol: "LT", views: "1.5k" },
    { symbol: "HYUNDAI", views: "1.2k" },
  ],
  // NOTE: needs a sector-tag map for all 50 Nifty instruments — backend not ready yet.
  sectors: [
    { name: "IT", change: 2.5, color: "#F0997B" },
    { name: "Pharma", change: 1.8, color: "#5DCAA5" },
    { name: "FMCG", change: 1.2, color: "#F0997B" },
    { name: "Banking", change: -0.8, color: "#ED93B1" },
    { name: "Auto", change: -0.4, color: "#ED93B1" },
  ],
};

const COLORS = {
  headerBlue: "#2F6BFF",
  bg: "#F1F3F9",
  card: "#FFFFFF",
  border: "#E9EBF2",
  textPrimary: "#14161B",
  textSecondary: "#6B7280",
  green: "#16A34A",
  red: "#DC2626",
};

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

function MarketMoodBanner({ mood }) {
  return (
    <View style={styles.moodBanner}>
      <View style={styles.moodCircle}>
        <Text style={styles.moodPercentage}>{mood.percentage}%</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.moodLabel}>{mood.label}</Text>
        <Text style={styles.moodSubtext}>{mood.subtext}</Text>
      </View>
    </View>
  );
}

function IndicesGrid({ indices }) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Indices</Text>
      <View style={styles.indicesGrid}>
        {indices.map((item) => {
          const isUp = item.change >= 0;
          return (
            <View key={item.symbol} style={styles.indexCard}>
              <Text style={styles.indexSymbol}>{item.symbol}</Text>
              <Text style={styles.indexValue}>{item.value}</Text>
              <Text
                style={[
                  styles.indexChange,
                  { color: isUp ? COLORS.green : COLORS.red },
                ]}
              >
                {isUp ? "+" : ""}
                {item.change.toFixed(2)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Reusable list card — used for gainers, losers, most active, trending
function StockListCard({ title, icon, data, renderRight }) {
  return (
    <View>
      <View style={styles.cardHeaderRow}>
        {icon ? (
          <Feather
            name={icon}
            size={13}
            color={COLORS.textSecondary}
            style={{ marginRight: 6 }}
          />
        ) : null}

        <Text style={styles.sectionLabel}>{title}</Text>
      </View>

      <View style={styles.card}>
        {data.map((item, idx) => (
          <View
            key={item.symbol}
            style={[
              styles.listRow,
              idx === data.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <Text style={styles.listSymbol}>{item.symbol}</Text>
            {renderRight(item)}
          </View>
        ))}
      </View>
    </View>
  );
}

function SectorPerformanceCard({ sectors }) {
  const total = sectors.reduce((sum, s) => sum + Math.abs(s.change), 0);
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Sector performance</Text>
      <View style={styles.sectorBar}>
        {sectors.map((s) => (
          <View
            key={s.name}
            style={{
              flex: Math.abs(s.change) / total,
              backgroundColor: s.color,
              height: "100%",
            }}
          />
        ))}
      </View>
      {sectors.map((s, idx) => {
        const isUp = s.change >= 0;
        return (
          <View
            key={s.name}
            style={[
              styles.listRow,
              idx === sectors.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.sectorDot, { backgroundColor: s.color }]} />
              <Text style={styles.listSymbol}>{s.name}</Text>
            </View>
            <Text
              style={{
                color: isUp ? COLORS.green : COLORS.red,
                fontWeight: "500",
                fontSize: 13,
              }}
            >
              {isUp ? "+" : ""}
              {s.change.toFixed(1)}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────

export default function MarketPage() {
  const [marketData, setMarketData] = useState(MOCK_MARKET_DATA);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: replace with real fetch once backend is ready, e.g.
    // const res = await fetch(`${API_BASE_URL}/api/markets/overview`);
    // const data = await res.json();
    // setMarketData(data);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={[COLORS.headerBlue, "#1E52D6"]}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>Markets</Text>
          </View>
          <MarketMoodBanner mood={marketData.mood} />
        </LinearGradient>

        <View style={styles.body}>
          <IndicesGrid indices={marketData.indices} />

          <StockListCard
            title="Top gainers"
            icon="trending-up"
            data={marketData.gainers}
            renderRight={(item) => (
              <Text
                style={{ color: COLORS.green, fontWeight: "500", fontSize: 13 }}
              >
                +{item.change.toFixed(2)}%
              </Text>
            )}
          />

          <StockListCard
            title="Top losers"
            icon="trending-down"
            data={marketData.losers}
            renderRight={(item) => (
              <Text
                style={{ color: COLORS.red, fontWeight: "500", fontSize: 13 }}
              >
                {item.change.toFixed(2)}%
              </Text>
            )}
          />

          <StockListCard
            title="Most active"
            icon="bar-chart-2"
            data={marketData.mostActive}
            renderRight={(item) => (
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                Vol {item.volume}
              </Text>
            )}
          />

          <StockListCard
            title="Trending on Stocksy"
            icon="trending-up"
            data={marketData.trending}
            renderRight={(item) => (
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                {item.views} views
              </Text>
            )}
          />

          <SectorPerformanceCard sectors={marketData.sectors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.headerBlue,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  moodBanner: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  moodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  moodPercentage: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  moodLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  moodSubtext: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  indicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  indexCard: {
    width: "48.5%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  indexSymbol: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  indexValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  indexChange: {
    fontSize: 12,
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 12,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  listSymbol: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  sectorBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  sectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});
