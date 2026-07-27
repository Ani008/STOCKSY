import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Shadows, moderateScale, fontScale } from "../theme";

const CHECK_SIZE = moderateScale(84);

export default function OrderSuccessScreen({ route, navigation }) {
  const {
    symbol,
    orderType,      // "BUY" | "SELL"
    quantity,
    price,
    productType,    // "CNC" | "MIS"
    amount,          // margin (BUY+MIS) or full value
    walletName,
  } = route.params;

  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDone = () => {
    // Reset rather than goBack — pressing "Done" should land the user
    // back on the main app, not walk back through StockDetail → BuyOrder
    // which would just be the same completed order form sitting there.
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  const isBuy = orderType === "BUY";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={moderateScale(44)} color={Colors.white} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fade, alignItems: "center", width: "100%" }}>
          <Text style={styles.title}>
            {isBuy ? "Order placed" : "Order sold"}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>
            {isBuy ? "Bought" : "Sold"} {quantity} × {symbol}
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Price per share</Text>
              <Text style={styles.rowVal} numberOfLines={1}>
                ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Quantity</Text>
              <Text style={styles.rowVal} numberOfLines={1}>{quantity}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Product</Text>
              <Text style={styles.rowVal} numberOfLines={1}>
                {productType === "MIS" ? "Intraday" : "Delivery"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Wallet</Text>
              <Text style={styles.rowVal} numberOfLines={1}>{walletName}</Text>
            </View>
            <View style={[styles.row, styles.rowTotal]}>
              <Text style={[styles.rowKey, styles.rowTotalKey]}>
                {isBuy ? "Margin used" : "Credited"}
              </Text>
              <Text style={styles.rowTotalVal} numberOfLines={1} adjustsFontSizeToFit>
                ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.88}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(28),
  },
  checkCircle: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScale(20),
    shadowColor: Colors.success,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontSize: fontScale(Typography.h3),
    fontWeight: "700",
    color: Colors.text,
    marginBottom: moderateScale(6),
  },
  subtitle: {
    fontSize: fontScale(Typography.body),
    color: Colors.textSecondary,
    marginBottom: moderateScale(28),
    maxWidth: "100%",
  },
  detailsCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(14),
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: moderateScale(16),
    marginBottom: moderateScale(32),
    ...Shadows.card,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(8),
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
    gap: moderateScale(12),
  },
  rowTotal: {
    borderBottomWidth: 0,
    paddingTop: moderateScale(12),
  },
  rowKey: {
    fontSize: fontScale(Typography.caption),
    color: Colors.textSecondary,
  },
  rowTotalKey: {
    color: Colors.text,
    fontWeight: "700",
  },
  rowVal: {
    fontSize: fontScale(Typography.caption),
    fontWeight: "600",
    color: Colors.text,
    flexShrink: 1,
    textAlign: "right",
  },
  rowTotalVal: {
    fontSize: fontScale(Typography.h4),
    fontWeight: "700",
    color: Colors.primaryDark,
    flexShrink: 1,
    textAlign: "right",
  },
  doneBtn: {
    width: "100%",
    backgroundColor: Colors.primaryDark,
    borderRadius: moderateScale(14),
    paddingVertical: moderateScale(15),
    alignItems: "center",
    position: "absolute",
    bottom: moderateScale(32),
    left: moderateScale(28),
    right: moderateScale(28),
    ...Shadows.floating,
    shadowColor: Colors.primaryDark,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: fontScale(Typography.body),
    fontWeight: "600",
  },
});