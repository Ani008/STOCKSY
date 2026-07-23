import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

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
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            // Fallback: show ticker initials if no logo URL provided
            <Text style={styles.fallbackText}>
              {ticker?.slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ marginLeft: moderateScale(12) }}>
          <Text style={styles.ticker}>{name}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>{price}</Text>
        {change ? (
          <Text
            style={[
              styles.change,
              { color: isPositive ? Colors.success : Colors.danger },
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

    backgroundColor: Colors.white,

    padding: moderateScale(16),

    borderRadius: 18,

    marginBottom: moderateScale(12),

    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,

    elevation: 4,
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,

    backgroundColor: Colors.white,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: Colors.divider,

    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 3,

    overflow: "hidden",
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  fallbackText: {
    fontSize: fontScale(Typography.caption),
    fontWeight: "700",
    color: Colors.primary,
  },
  ticker: { fontSize: fontScale(Typography.body), fontWeight: "bold", color: Colors.text },
  name: { fontSize: fontScale(Typography.small), color: Colors.textMuted, marginTop: moderateScale(2) },
  right: { alignItems: "flex-end" },
  price: { fontSize: fontScale(Typography.body), fontWeight: "bold", color: Colors.text },
  change: { fontSize: fontScale(Typography.small), fontWeight: "600", marginTop: moderateScale(2) },
});

export default WatchlistItem;
