import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

/**
 * WalletCard
 * Premium reusable card for a single sub-wallet.
 *
 * Props:
 * @param {string}   name           - Wallet display name
 * @param {number}   balance        - Wallet balance (number)
 * @param {string}   [iconName]     - Ionicons icon name
 * @param {string}   [iconColor]    - Icon colour hex
 * @param {object}   [style]        - Extra styles for the outer container
 * @param {function} [onPressActions] - Three-dot menu handler
 */
const WalletCard = ({
  name,
  balance,
  iconName = "wallet-outline",
  iconColor = Colors.gain,
  style,
  onPressActions,
}) => {
  const formattedBalance = Number(balance).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={[styles.card, style]}>
      <View style={styles.leftSection}>
        <View style={[styles.iconBox, { backgroundColor: iconColor + "18" }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.walletName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.walletBalance}>₹{formattedBalance}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onPressActions}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: moderateScale(16),
    marginBottom: moderateScale(10),
    justifyContent: "space-between",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(14),
  },
  info: { flex: 1 },
  walletName: {
    fontSize: fontScale(14),
    fontWeight: "600",
    color: Colors.text,
    marginBottom: moderateScale(3),
    letterSpacing: 0.1,
  },
  walletBalance: {
    fontSize: fontScale(Typography.caption),
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});

export default WalletCard;