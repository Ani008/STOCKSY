import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fade, alignItems: "center", width: "100%" }}>
          <Text style={styles.title}>
            {isBuy ? "Order placed" : "Order sold"}
          </Text>
          <Text style={styles.subtitle}>
            {isBuy ? "Bought" : "Sold"} {quantity} × {symbol}
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Price per share</Text>
              <Text style={styles.rowVal}>
                ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Quantity</Text>
              <Text style={styles.rowVal}>{quantity}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Product</Text>
              <Text style={styles.rowVal}>
                {productType === "MIS" ? "Intraday" : "Delivery"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Wallet</Text>
              <Text style={styles.rowVal}>{walletName}</Text>
            </View>
            <View style={[styles.row, styles.rowTotal]}>
              <Text style={[styles.rowKey, { color: "#0F172A", fontWeight: "700" }]}>
                {isBuy ? "Margin used" : "Credited"}
              </Text>
              <Text style={styles.rowTotalVal}>
                ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 28,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEF1F6",
  },
  rowTotal: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  rowKey: {
    fontSize: 13,
    color: "#64748B",
  },
  rowVal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  rowTotalVal: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A56DB",
  },
  doneBtn: {
    width: "100%",
    backgroundColor: "#1A56DB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    position: "absolute",
    bottom: 32,
    left: 28,
    right: 28,
  },
  doneBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});