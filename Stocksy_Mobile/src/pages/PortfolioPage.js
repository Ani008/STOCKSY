// src/pages/PortfolioPage.js
// ─────────────────────────────────────────────────────────────────────────────
// Portfolio screen — shows total assets, performance chart (SVG), return tiles,
// holdings list, and allocation bar.
//
// Navigation: registered as 'Portfolio' in App.js
// Reused components: WatchlistItem (holdings list)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

// ─── Constants ───────────────────────────────────────────────────────────────

const BLUE = "#1A56DB";
const BLUE_DARK = "#1240A8";
const GREEN = "#16a34a";
const RED = "#dc2626";
const BG = "#F4F6FB";
const WHITE = "#FFFFFF";
const TEXT_PRI = "#111827";
const TEXT_SEC = "#6B7280";
const BORDER = "#E5E7EB";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Placeholder Data ────────────────────────────────────────────────────────

const HOLDINGS = [
  {
    id: "1",
    ticker: "AMZN",
    name: "Amazon, Inc.",
    shares: "2 shares",
    price: "$3,821.60",
    change: "▲ 1.76%",
    isPositive: true,
    iconName: "logo-amazon",
    iconColor: "#FF9900",
    allocation: 42,
  },
  {
    id: "2",
    ticker: "AAPL",
    name: "Apple, Inc.",
    shares: "5 shares",
    price: "$924.15",
    change: "▼ 0.43%",
    isPositive: false,
    iconName: "logo-apple",
    iconColor: "#555555",
    allocation: 20,
  },
  {
    id: "3",
    ticker: "TSLA",
    name: "Tesla, Inc.",
    shares: "3 shares",
    price: "$2,597.94",
    change: "▼ 1.86%",
    isPositive: false,
    iconName: "car-sport-outline",
    iconColor: "#E31937",
    allocation: 25,
  },
  {
    id: "4",
    ticker: "MSFT",
    name: "Microsoft, Corp",
    shares: "1 share",
    price: "$364.54",
    change: "▼ 0.74%",
    isPositive: false,
    iconName: "logo-windows",
    iconColor: "#00A4EF",
    allocation: 13,
  },
];

const ALLOCATION_COLORS = [BLUE, "#FF9900", "#E31937", "#00A4EF"];

// ─── Helper: build SVG path string from normalised points ────────────────────

function buildPath(points, w, h, pad = 10) {
  const usableW = w - pad * 2;
  const usableH = h - pad * 2;
  return points
    .map((y, i) => {
      const x = pad + (i / (points.length - 1)) * usableW;
      const svgY = pad + y * usableH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${svgY.toFixed(1)}`;
    })
    .join(" ");
}

function buildFillPath(points, w, h, pad = 10) {
  const line = buildPath(points, w, h, pad);
  const lastX = (pad + w - pad).toFixed(1);
  const firstX = pad.toFixed(1);
  const bottom = h.toFixed(1);
  return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Inline holding row (mirrors WatchlistItem structure but shows shares subtitle)
function HoldingRow({ item, onPress }) {
  return (
    <TouchableOpacity
      style={styles.holdingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.holdingIcon, { backgroundColor: item.iconColor + "18" }]}
      >
        <Ionicons name={item.iconName} size={20} color={item.iconColor} />
      </View>
      <View style={styles.holdingInfo}>
        <Text style={styles.holdingTicker}>{item.ticker}</Text>
        <Text style={styles.holdingShares}>{item.shares}</Text>
      </View>
      <View style={styles.holdingRight}>
        <Text style={styles.holdingPrice}>{item.price}</Text>
        <Text
          style={[
            styles.holdingChange,
            { color: item.isPositive ? GREEN : RED },
          ]}
        >
          {item.change}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Allocation bar with legend
function AllocationBar({ holdings }) {
  return (
    <View>
      {/* Bar */}
      <View style={styles.allocBar}>
        {holdings.map((h, i) => (
          <View
            key={h.id}
            style={[
              styles.allocSegment,
              {
                flex: h.allocation,
                backgroundColor: ALLOCATION_COLORS[i] || "#ccc",
                borderTopLeftRadius: i === 0 ? 6 : 0,
                borderBottomLeftRadius: i === 0 ? 6 : 0,
                borderTopRightRadius: i === holdings.length - 1 ? 6 : 0,
                borderBottomRightRadius: i === holdings.length - 1 ? 6 : 0,
              },
            ]}
          />
        ))}
      </View>
      {/* Legend */}
      <View style={styles.allocLegend}>
        {holdings.map((h, i) => (
          <View key={h.id} style={styles.allocLegendItem}>
            <View
              style={[
                styles.allocDot,
                { backgroundColor: ALLOCATION_COLORS[i] || "#ccc" },
              ]}
            />
            <Text style={styles.allocLabel}>
              {h.ticker} {h.allocation}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortfolioPage({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("1D");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={"#3B82F6"} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')} style={styles.moreBtn}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Total Assets (still in blue zone) ── */}
      <View style={styles.assetZone}>
        <Text style={styles.assetLabel}>Total Assets</Text>
        <View style={styles.assetRow}>
          <Text style={styles.assetValue}>$27,170.01</Text>
          <Ionicons
            name="eye-outline"
            size={18}
            color="rgba(255,255,255,0.7)"
            style={{ marginLeft: 8 }}
          />
        </View>
        <View style={styles.assetBadge}>
          <Ionicons name="caret-up" size={12} color={WHITE} />
          <Text style={styles.assetBadgeText}>3.87% (24h)</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Return Tiles ── */}
        <View style={styles.tileRow}>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Today's return</Text>
            <Text style={styles.tileValue}>$981.19</Text>
            <View style={styles.tileChange}>
              <Ionicons name="caret-up" size={11} color={GREEN} />
              <Text style={[styles.tileChangeTxt, { color: GREEN }]}>
                1.56%
              </Text>
            </View>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Total return</Text>
            <Text style={styles.tileValue}>$3,170.01</Text>
            <View style={styles.tileChange}>
              <Ionicons name="caret-down" size={11} color={RED} />
              <Text style={[styles.tileChangeTxt, { color: RED }]}>0.32%</Text>
            </View>
          </View>
        </View>

        {/* ── Holdings ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Holdings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {HOLDINGS.map((item) => (
            <HoldingRow key={item.id} item={item} onPress={() => {}} />
          ))}
        </View>

        {/* ── Allocation ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Allocation</Text>
          <View style={{ marginTop: 14 }}>
            <AllocationBar holdings={HOLDINGS} />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#3B82F6",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    marginTop: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: WHITE,
  },
  moreBtn: {
    width: 40, // Width and Height must be equal
    height: 40,
    borderRadius: 20, // Half of width/height makes it a perfect circle
    backgroundColor: "#2563EB", // Use your primary blue color
    justifyContent: "center", // Centers icon vertically
    alignItems: "center", // Centers icon horizontally
    // Optional: add a slight shadow to match your cards
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Asset zone (blue background)
  assetZone: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  assetLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetValue: {
    fontSize: 30,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: -0.5,
  },
  assetBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 6,
    gap: 3,
  },
  assetBadgeText: {
    fontSize: 12,
    color: WHITE,
    fontWeight: "500",
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: BORDER,
  },

  // Time filter
  filterRow: {
    flexDirection: "row",
    gap: 6,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 5,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: BG,
  },
  filterTabActive: {
    backgroundColor: BLUE,
  },
  filterText: {
    fontSize: 11,
    color: TEXT_SEC,
    fontWeight: "500",
  },
  filterTextActive: {
    color: WHITE,
    fontWeight: "600",
  },

  // Return tiles
  tileRow: {
    flexDirection: "row",
    gap: 12,
  },
  tile: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  tileLabel: {
    fontSize: 11,
    color: TEXT_SEC,
    marginBottom: 4,
  },
  tileValue: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRI,
    marginBottom: 2,
  },
  tileChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  tileChangeTxt: {
    fontSize: 11,
    fontWeight: "500",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRI,
  },
  seeAll: {
    fontSize: 13,
    color: BLUE,
    fontWeight: "500",
  },

  // Holding row
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    gap: 12,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  holdingInfo: {
    flex: 1,
  },
  holdingTicker: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRI,
  },
  holdingShares: {
    fontSize: 11,
    color: TEXT_SEC,
    marginTop: 1,
  },
  holdingRight: {
    alignItems: "flex-end",
  },
  holdingPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRI,
  },
  holdingChange: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },

  // Allocation
  allocBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
    gap: 2,
  },
  allocSegment: {
    height: "100%",
  },
  allocLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  allocLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  allocDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  allocLabel: {
    fontSize: 11,
    color: TEXT_SEC,
  },
});
