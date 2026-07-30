import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

// Status → badge colour. Mirrors the order_status enum on the backend
// (PENDING, OPEN, PARTIALLY_FILLED, FILLED, CANCELLED, REJECTED).
const STATUS_STYLE = {
  FILLED: { color: Colors.gain, bg: Colors.gainBg, label: "Filled" },
  PARTIALLY_FILLED: { color: Colors.warning, bg: Colors.warningBg, label: "Partial" },
  OPEN: { color: Colors.primaryDark, bg: Colors.primaryLight, label: "Open" },
  PENDING: { color: Colors.primaryDark, bg: Colors.primaryLight, label: "Pending" },
  CANCELLED: { color: Colors.textMuted, bg: Colors.divider, label: "Cancelled" },
  REJECTED: { color: Colors.loss, bg: Colors.lossBg, label: "Rejected" },
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} · ${timePart}`;
};

const formatINR = (value) =>
  Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

/**
 * @param {object} order - a row from GET /api/orders
 */
const OrderRow = ({ order }) => {
  const isBuy = order.side === "BUY";
  const tint = isBuy ? Colors.gain : Colors.loss;
  const statusStyle = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING;

  // Prefer the actual fill price once the order has traded; fall back to
  // the limit/trigger price for orders still working or rejected.
  const displayPrice = order.avg_fill_price ?? order.price ?? order.trigger_price;
  const displayQty = Number(order.filled_qty) > 0 ? order.filled_qty : order.quantity;

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: tint + "18" }]}>
        <Ionicons
          name={isBuy ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
          size={20}
          color={tint}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.symbol} numberOfLines={1}>
            {order.symbol}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          <Text style={{ color: tint, fontWeight: "700" }}>{order.side}</Text>
          {"  ·  "}
          {order.order_type}
          {"  ·  "}
          {order.product_type === "MIS" ? "Intraday" : "Delivery"}
        </Text>

        <Text style={styles.time}>{formatDateTime(order.placed_at)}</Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.price}>
          {displayPrice ? `₹${formatINR(displayPrice)}` : "Market"}
        </Text>
        <Text style={styles.qty}>Qty {formatINR(displayQty)}</Text>
      </View>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    marginBottom: moderateScale(2),
  },
  symbol: {
    fontSize: fontScale(14),
    fontWeight: "700",
    color: Colors.text,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: 999,
  },
  badgeText: {
    fontSize: fontScale(Typography.tiny),
    fontWeight: "700",
  },
  meta: {
    fontSize: fontScale(Typography.tiny),
    color: Colors.textSecondary,
    marginBottom: moderateScale(2),
  },
  time: {
    fontSize: fontScale(Typography.tiny),
    color: Colors.textMuted,
  },
  rightCol: { alignItems: "flex-end" },
  price: {
    fontSize: fontScale(Typography.body),
    fontWeight: "700",
    color: Colors.text,
    marginBottom: moderateScale(2),
  },
  qty: {
    fontSize: fontScale(Typography.tiny),
    color: Colors.textMuted,
  },
});

export default OrderRow;
