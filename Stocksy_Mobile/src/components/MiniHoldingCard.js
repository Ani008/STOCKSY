import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * MiniHoldingCard — Small holding chip inside the Total Assets card.
 *
 * Props:
 *   ticker      string (required)  — Ticker label. e.g. "AMZN"
 *   name        string (required)  — Company name. e.g. "Amazon, Inc"
 *   change      string             — Change string. e.g. "▲ 1.76%"
 *   isPositive  boolean / true     — Controls change color.
 *   iconName    string             — Ionicons icon name.
 *   iconColor   string / "black"   — Icon color.
 */
const MiniHoldingCard = ({
  ticker,
  name,
  change,
  isPositive = true,
  iconName = "bar-chart-outline",
  iconColor = "#1E293B",
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.text}>
        <Text style={styles.ticker}>{ticker}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      {change ? (
        <Text style={[styles.change, { color: isPositive ? "#10B981" : "#EF4444" }]}>
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
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  text: { flex: 1, marginLeft: 8 },
  ticker: { fontSize: 12, fontWeight: "bold", color: "#1E293B" },
  name: { fontSize: 10, color: "#94A3B8" },
  change: { fontSize: 10, fontWeight: "600" },
});

export default MiniHoldingCard;
