import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

/**
 * WatchlistItem — Reusable row for the Watchlist section.
 *
 * Props:
 *   ticker      string (required)  — Stock ticker. e.g. "MSFT"
 *   name        string (required)  — Company name. e.g. "Microsoft, Corp"
 *   price       string (required)  — Current price. e.g. "$716.21"
 *   change      string             — Change string. e.g. "▲ 1.33%"
 *   isPositive  boolean            — Controls change color.
 *   logoUrl     string             — Clearbit logo URL. e.g. "https://logo.clearbit.com/microsoft.com"
 *   onPress     function           — Optional tap handler for the whole row.
 */
const WatchlistItem = ({
  ticker,
  name,
  price,
  change,
  isPositive = true,
  logoUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
            />
          ) : (
            // Fallback: show ticker initials if no logo URL provided
            <Text style={styles.fallbackText}>
              {ticker?.slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.ticker}>{name}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>{price}</Text>
        {change ? (
          <Text
            style={[
              styles.change,
              { color: isPositive ? "#10B981" : "#EF4444" },
            ]}
          >
            {change}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  fallbackText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },
  ticker: { fontSize: 15, fontWeight: "bold", color: "#1E293B" },
  name: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  right: { alignItems: "flex-end" },
  price: { fontSize: 15, fontWeight: "bold", color: "#1E293B" },
  change: { fontSize: 12, fontWeight: "600", marginTop: 2 },
});

export default WatchlistItem;
