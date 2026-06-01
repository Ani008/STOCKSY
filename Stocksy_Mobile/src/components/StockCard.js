import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

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
                { color: isPositive ? "#10B981" : "#EF4444" },
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
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  ticker: { fontSize: 15, fontWeight: "bold", color: "#1E293B" },
  name: { fontSize: 11, color: "#94A3B8", marginBottom: 12 },
  label: {
    fontSize: 10,
    color: "#94A3B8",
    backgroundColor: "#F1F5F9",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35,
  },
  price: { fontSize: 15, fontWeight: "bold", color: "#1E293B" },
  change: { fontSize: 11, fontWeight: "600" },

  logo: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },

  fallbackText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },
});

export default StockCard;
