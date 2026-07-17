import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * MiniHoldingCard — Small holding chip inside the Total Assets card.
 *
 * Props:
 *   ticker      string (required)  — Ticker label. e.g. "NIFTY 50"
 *   name        string (required)  — Company name or live price. e.g. "₹23,892"
 *   change      string             — Change string. e.g. "▲ 1.76%"
 *   isPositive  boolean            — Controls change color.
 *   logoUrl     string             — Image URL for logo (takes priority over iconName).
 *   iconName    string             — Ionicons icon name (fallback if no logoUrl).
 *   iconColor   string             — Icon color (only used when falling back to Ionicons).
 */
const MiniHoldingCard = ({
  ticker,
  name,
  change,
  isPositive = true,
  logoUrl,
  iconName = "bar-chart-outline",
  iconColor = "#1E293B",
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        ) : (
          <Ionicons name={iconName} size={18} color={iconColor} />
        )}
      </View>
      <View style={styles.text}>
        <Text style={styles.ticker}>{ticker}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      {change ? (
        <Text
          style={[styles.change, { color: isPositive ? "#10B981" : "#EF4444" }]}
        >
          {change}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",

    padding: 12,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "#F1F5F9",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 3,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#F1F5F9",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,

    elevation: 2,

    overflow: "hidden",
  },
  logo: {
    width: 32,
    height: 32,
  },
  text: { flex: 1, marginLeft: 8 },
  // Suggested Style Changes
  ticker: {
    fontSize: 10,
    fontWeight: "600", // Slightly less heavy than 'bold'
    color: "#64748B", // Soft slate/gray color
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13, // Bumped up slightly
    color: "#000000", // True black for importance
    fontWeight: "700", // Heavy bold
  },
  change: { fontSize: 10, fontWeight: "600" },
});

export default MiniHoldingCard;
