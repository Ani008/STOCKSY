import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import OrderRow from "../components/OrderRow";
import SegmentedToggle from "../components/SegmentedToggle";
import { fetchOrders } from "../../services/orderService";
import { Colors, Typography, fontScale, moderateScale } from "../theme";

const OrderHistoryPage = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Same Delivery (CNC) / Intraday (MIS) split used on the Dashboard's
  // Total Assets card — orders carry the same product_type field as
  // positions do, so it maps 1:1.
  const [productTab, setProductTab] = useState("delivery");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchOrders(200);
      setOrders(data || []);
    } catch (err) {
      // Global toast already covers this.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh whenever this screen regains focus — a freshly placed order
  // should show up without the person needing to pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const deliveryOrders = useMemo(
    () => orders.filter((o) => o.product_type !== "MIS"),
    [orders]
  );
  const intradayOrders = useMemo(
    () => orders.filter((o) => o.product_type === "MIS"),
    [orders]
  );
  const activeOrders = productTab === "delivery" ? deliveryOrders : intradayOrders;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gain} />
        <Text style={styles.loadingText}>Loading your orders…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surfaceAlt} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={moderateScale(20)} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Order History</Text>

        <View style={styles.headerBtn} />
      </View>

      <View style={styles.toggleRow}>
        <SegmentedToggle
          theme="neutral"
          value={productTab}
          onChange={setProductTab}
          options={[
            { key: "delivery", label: `Delivery${deliveryOrders.length ? ` (${deliveryOrders.length})` : ""}` },
            { key: "intraday", label: `Intraday${intradayOrders.length ? ` (${intradayOrders.length})` : ""}` },
          ]}
        />
      </View>

      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <OrderRow order={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={Colors.gain}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconRing}>
              <Ionicons
                name="document-text-outline"
                size={moderateScale(28)}
                color={Colors.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>
              No {productTab === "delivery" ? "delivery" : "intraday"} orders yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Every order you place will show up here — filled, open, or cancelled.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surfaceAlt,
  },
  loadingText: {
    marginTop: moderateScale(12),
    color: Colors.textSecondary,
    fontSize: fontScale(Typography.caption),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(14),
  },
  headerBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: fontScale(Typography.h4),
    fontWeight: "700",
    color: Colors.text,
  },
  toggleRow: {
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(14),
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(40),
    flexGrow: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: moderateScale(60),
    gap: moderateScale(8),
  },
  emptyIconRing: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(4),
  },
  emptyTitle: {
    fontSize: fontScale(Typography.body),
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: fontScale(Typography.caption),
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: moderateScale(20),
    paddingHorizontal: moderateScale(24),
  },
});

export default OrderHistoryPage;
