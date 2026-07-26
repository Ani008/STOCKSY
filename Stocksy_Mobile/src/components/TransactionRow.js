import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

// Icon per transaction type — colour comes from direction (credit/debit).
const ICONS = {
  wallet_created: "wallet-outline",
  wallet_deleted: "arrow-undo-outline",
  stock_buy: "arrow-down-circle-outline",
  stock_sell: "arrow-up-circle-outline",
};

const formatINR = (value) =>
  Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const formatDateTime = (iso) => {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
  const timePart = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
};

/**
 * @param {object} tx - normalized transaction from GET /wallet/transactions
 */
const TransactionRow = ({ tx }) => {
  const isCredit = tx.direction === "credit";
  const tintColor = isCredit ? Colors.gain : Colors.loss;
  const iconName = ICONS[tx.type] || "swap-vertical-outline";

  const subtitle = tx.symbol
    ? `${tx.symbol}${tx.walletName ? ` · ${tx.walletName}` : ""}`
    : tx.walletName || tx.note;

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: tintColor + "18" }]}>
        <Ionicons name={iconName} size={20} color={tintColor} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        <Text style={styles.time}>{formatDateTime(tx.createdAt)}</Text>
      </View>

      <Text style={[styles.amount, { color: tintColor }]}>
        {isCredit ? "+" : "-"}₹{formatINR(tx.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: moderateScale(14),
    marginBottom: moderateScale(10),
    shadowColor: Colors.textMuted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  info: { flex: 1, marginRight: moderateScale(8) },
  title: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: Colors.text,
    marginBottom: moderateScale(2),
  },
  subtitle: {
    fontSize: fontScale(Typography.tiny),
    color: Colors.textSecondary,
    marginBottom: moderateScale(2),
  },
  time: {
    fontSize: fontScale(Typography.tiny),
    color: Colors.textMuted,
  },
  amount: {
    fontSize: fontScale(Typography.body),
    fontWeight: "700",
  },
});

export default TransactionRow;