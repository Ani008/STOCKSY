import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

/**
 * StockCard — Reusable horizontal-scroll stock card for Top Stocks section.
 *
 * Props:
 *   ticker      string (required)  — Stock ticker symbol. e.g. "TSLA"
 *   name        string (required)  — Full company name. e.g. "Tesla, Inc."
 *   price       string (required)  — Formatted price string. e.g. "$131.46"
 *   change      string             — Formatted change string. e.g. "▲ 2.13%"
 *   isPositive  boolean / true     — Controls change color (green vs red).
 *   iconName    string             — Ionicons icon name. e.g. "logo-microsoft"
 *   iconColor   string             — Icon color hex. e.g. "#00A4EF"
 */
const StockCard = ({
  ticker,
  name,
  price,
  change,
  isPositive = true,
  logoUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <Text style={styles.fallbackText}>
              {ticker?.slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.ticker}>{name}</Text>

        <View style={styles.priceRow}>
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
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 155,
    backgroundColor: "white",
    borderRadius: 20,
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(10),
  },
  ticker: { fontSize: fontScale(Typography.body), fontWeight: "bold", color: Colors.text },
  name: { fontSize: fontScale(Typography.tiny), color: Colors.textMuted, marginBottom: moderateScale(12) },
  label: {
    fontSize: fontScale(10),
    color: Colors.textMuted,
    backgroundColor: Colors.divider,
    alignSelf: "flex-start",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: 4,
    marginBottom: moderateScale(6),
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: moderateScale(35),
  },
  price: { fontSize: fontScale(Typography.body), fontWeight: "bold", color: Colors.text },
  change: { fontSize: fontScale(Typography.tiny), fontWeight: "600" },

  logo: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },

  fallbackText: {
    fontSize: fontScale(Typography.caption),
    fontWeight: "700",
    color: Colors.primary,
  },
});

export default StockCard;
