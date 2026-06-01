import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import CreateWalletModal from "../components/CreateWalletModal";
import { walletService } from "../../services/walletService";
import { fetchWallets, createWallet } from "../../services/walletService";
import { placeOrder } from "../../services/orderService";
import useMarketData from "../hooks/useMarketData";

/**
 * BuyOrderScreen
 *
 * Props (via navigation params):
 *   instrumentKey  string  e.g. "NSE_EQ|INE002A01018"
 *   symbol         string  e.g. "RELIANCE"
 *   name           string  e.g. "Reliance Industries Ltd"
 *   sector         string  e.g. "Energy"
 *   orderType      string  "BUY" | "SELL"  — defaults to "BUY"
 */

export default function BuyOrderScreen({ navigation, route }) {
  const {
    instrumentKey,
    symbol = "STOCK",
    name = "Stock Name",
    sector = "Equity",
    orderType: initialOrderType = "BUY",
  } = route.params || {};

  // ─── Order state ────────────────────────────────────────────────────────────
  const [orderType, setOrderType] = useState(initialOrderType); // BUY | SELL
  const [tradeType, setTradeType] = useState("Intraday"); // Intraday | Delivery
  const [qty, setQty] = useState("");
  const [priceLimit, setPriceLimit] = useState("");
  const [orderMode, setOrderMode] = useState("Market"); // Market | Limit

  // ─── Wallet state ────────────────────────────────────────────────────────────
  const [wallets, setWallets] = useState([]);
  const [demoBalance, setDemoBalance] = useState(0);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ─── Live price ──────────────────────────────────────────────────────────────
  const { prices } = useMarketData();
  const liveData = prices[instrumentKey] || {};
  const ltp = liveData.ltp || 0;
  const cp = liveData.cp || 0;
  const priceChange = ltp && cp ? ltp - cp : 0;
  const pricePct = cp ? ((priceChange / cp) * 100).toFixed(2) : "0.00";
  const isPositive = priceChange >= 0;

  // ─── Animation for live price flash ─────────────────────────────────────────
  const flashAnim = useRef(new Animated.Value(1)).current;
  const prevLtp = useRef(ltp);

  useEffect(() => {
    if (ltp && ltp !== prevLtp.current) {
      prevLtp.current = ltp;
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 0.2,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [ltp]);

  // ─── Load wallets ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadWallets();
  }, []);

  async function loadWallets() {
    setWalletsLoading(true);
    try {
      const data = await fetchWallets();
      setWallets(data.wallets || []);
      setDemoBalance(data.demoBalance || 0);
      if (data.wallets && data.wallets.length > 0) {
        setSelectedWalletId(data.wallets[0].id);
      }
    } catch (e) {
      Alert.alert("Error", "Could not load wallets. Please try again.");
    } finally {
      setWalletsLoading(false);
    }
  }

  async function handleCreateWallet({ name: walletName, amount }) {
    setCreatingWallet(true);
    try {
      const data = await createWallet({ name: walletName, amount });
      setWallets(data.wallets || []);
      setDemoBalance(data.demoBalance || 0);
      // Auto-select the newly created wallet
      const newest = data.wallets?.[data.wallets.length - 1];
      if (newest) setSelectedWalletId(newest.id);
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "Could not create wallet.");
    } finally {
      setCreatingWallet(false);
    }
  }

  // ─── Computed values ─────────────────────────────────────────────────────────
  const effectivePrice =
    orderMode === "Limit" && priceLimit ? parseFloat(priceLimit) : ltp;
  const qtyNum = parseInt(qty) || 0;
  const orderTotal = effectivePrice * qtyNum;

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const walletBalance = selectedWallet?.balance || 0;
  const canAfford = orderType === "BUY" ? walletBalance >= orderTotal : true;
  const canPlace = qtyNum > 0 && selectedWalletId && canAfford && !placingOrder;

  // ─── Place order ─────────────────────────────────────────────────────────────
  async function handlePlaceOrder() {
    if (!canPlace) return;
    setPlacingOrder(true);
    try {
      // TODO: wire to your order API when ready
      // await orderService.placeOrder({ instrumentKey, symbol, qty: qtyNum, price: effectivePrice, tradeType, orderType, walletId: selectedWalletId });
      await placeOrder({
        instrument_key: instrumentKey,
        symbol,
        quantity: qtyNum,
        price: effectivePrice,
        order_type: orderMode.toUpperCase(),
        side: orderType,
        wallet_id: selectedWalletId,
        trade_type: tradeType,
      });
      Alert.alert(
        `Order Placed! 🎉`,
        `${orderType} ${qtyNum} × ${symbol}\n@ ₹${effectivePrice.toFixed(2)}\nTotal: ₹${orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\nWallet: ${selectedWallet?.name}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      Alert.alert("Order Failed", "Could not place order. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  // ─── Colour helpers ──────────────────────────────────────────────────────────
  const BUY_COLOR = "#00C851";
  const SELL_COLOR = "#FF4444";
  const accentColor = orderType === "BUY" ? BUY_COLOR : SELL_COLOR;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSymbol}>{symbol}</Text>
          <Text style={styles.headerName} numberOfLines={1}>
            {name}
          </Text>
        </View>
        {/* BUY / SELL toggle */}
        <View style={styles.orderTypeToggle}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              orderType === "BUY" && { backgroundColor: BUY_COLOR },
            ]}
            onPress={() => setOrderType("BUY")}
          >
            <Text
              style={[
                styles.toggleText,
                orderType === "BUY" && { color: "#fff" },
              ]}
            >
              BUY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              orderType === "SELL" && { backgroundColor: SELL_COLOR },
            ]}
            onPress={() => setOrderType("SELL")}
          >
            <Text
              style={[
                styles.toggleText,
                orderType === "SELL" && { color: "#fff" },
              ]}
            >
              SELL
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Live price bar ──────────────────────────────────────────────────── */}
      <View
        style={[styles.priceBar, { borderBottomColor: accentColor + "55" }]}
      >
        <View>
          <Text style={styles.priceLabel}>CURRENT PRICE</Text>
          <Animated.Text
            style={[
              styles.livePrice,
              {
                color: isPositive ? BUY_COLOR : SELL_COLOR,
                opacity: flashAnim,
              },
            ]}
          >
            ₹
            {ltp
              ? ltp.toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : "—"}
          </Animated.Text>
        </View>
        <View style={styles.priceChangeBadge}>
          <Ionicons
            name={isPositive ? "trending-up" : "trending-down"}
            size={14}
            color={isPositive ? BUY_COLOR : SELL_COLOR}
          />
          <Text
            style={[
              styles.priceChangeTxt,
              { color: isPositive ? BUY_COLOR : SELL_COLOR },
            ]}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)} ({pricePct}%)
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Trade type (Intraday / Delivery) ──────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TRADE TYPE</Text>
            <View style={styles.pillRow}>
              {["Intraday", "Delivery"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.pill,
                    tradeType === t && {
                      borderColor: accentColor,
                      backgroundColor: accentColor + "18",
                    },
                  ]}
                  onPress={() => setTradeType(t)}
                >
                  <Text
                    style={[
                      styles.pillTxt,
                      tradeType === t && { color: accentColor },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Order mode (Market / Limit) ───────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ORDER TYPE</Text>
            <View style={styles.pillRow}>
              {["Market", "Limit"].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.pill,
                    orderMode === m && {
                      borderColor: accentColor,
                      backgroundColor: accentColor + "18",
                    },
                  ]}
                  onPress={() => setOrderMode(m)}
                >
                  <Text
                    style={[
                      styles.pillTxt,
                      orderMode === m && { color: accentColor },
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── QTY + Price inputs ────────────────────────────────────────── */}
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>QTY</Text>
              <TextInput
                style={styles.input}
                value={qty}
                onChangeText={(v) => setQty(v.replace(/[^0-9]/g, ""))}
                placeholder="0"
                placeholderTextColor="#444"
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            {orderMode === "Limit" && (
              <View style={[styles.inputGroup, { flex: 1.4 }]}>
                <Text style={styles.inputLabel}>LIMIT PRICE (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={priceLimit}
                  onChangeText={(v) => setPriceLimit(v.replace(/[^0-9.]/g, ""))}
                  placeholder={ltp ? ltp.toFixed(2) : "0.00"}
                  placeholderTextColor="#444"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            )}
          </View>

          {/* ── Order summary ─────────────────────────────────────────────── */}
          {qtyNum > 0 && (
            <View
              style={[styles.summaryCard, { borderColor: accentColor + "40" }]}
            >
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Price per share</Text>
                <Text style={styles.summaryVal}>
                  ₹
                  {effectivePrice.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Quantity</Text>
                <Text style={styles.summaryVal}>{qtyNum}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text
                  style={[
                    styles.summaryKey,
                    { color: "#fff", fontWeight: "700" },
                  ]}
                >
                  Estimated Total
                </Text>
                <Text
                  style={[
                    styles.summaryVal,
                    { color: accentColor, fontWeight: "700", fontSize: 16 },
                  ]}
                >
                  ₹
                  {orderTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* ── Wallet selector ───────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SELECT WALLET</Text>

            {walletsLoading ? (
              <ActivityIndicator
                color={accentColor}
                style={{ marginVertical: 16 }}
              />
            ) : wallets.length === 0 ? (
              <View style={styles.noWalletBox}>
                <Ionicons name="wallet-outline" size={32} color="#444" />
                <Text style={styles.noWalletTxt}>No wallets yet</Text>
                <Text style={styles.noWalletSub}>
                  Create a wallet from your demo balance to start trading
                </Text>
                <TouchableOpacity
                  style={[styles.createWalletBtn, { borderColor: accentColor }]}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color={accentColor}
                  />
                  <Text
                    style={[styles.createWalletBtnTxt, { color: accentColor }]}
                  >
                    Create a Wallet
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 10 }}
                >
                  {wallets.map((w, i) => {
                    const isSelected = w.id === selectedWalletId;
                    const COLORS = [
                      "#3B82F6",
                      "#00C851",
                      "#FF9F43",
                      "#A855F7",
                      "#F43F5E",
                    ];
                    const wColor = COLORS[i % COLORS.length];
                    return (
                      <TouchableOpacity
                        key={w.id}
                        style={[
                          styles.walletChip,
                          isSelected && {
                            borderColor: wColor,
                            backgroundColor: wColor + "15",
                          },
                        ]}
                        onPress={() => setSelectedWalletId(w.id)}
                      >
                        <View
                          style={[
                            styles.walletChipIcon,
                            { backgroundColor: wColor + "30" },
                          ]}
                        >
                          <Ionicons
                            name="wallet-outline"
                            size={14}
                            color={wColor}
                          />
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.walletChipName,
                              isSelected && { color: wColor },
                            ]}
                          >
                            {w.name}
                          </Text>
                          <Text style={styles.walletChipBalance}>
                            ₹
                            {w.balance.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={wColor}
                            style={{ marginLeft: 6 }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {/* Add new wallet chip */}
                  <TouchableOpacity
                    style={[styles.walletChip, styles.walletChipAdd]}
                    onPress={() => setModalVisible(true)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.walletChipAddTxt}>New</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Selected wallet detail */}
                {selectedWallet && (
                  <View style={styles.walletDetailRow}>
                    <Text style={styles.walletDetailTxt}>
                      Available:{" "}
                      <Text style={{ color: "black", fontWeight: "600" }}>
                        ₹
                        {walletBalance.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </Text>
                    {orderType === "BUY" && qtyNum > 0 && !canAfford && (
                      <Text style={styles.insufficientTxt}>
                        ⚠ Insufficient balance
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Bottom spacer so button doesn't overlap */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Place order CTA ────────────────────────────────────────────────── */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              { backgroundColor: canPlace ? accentColor : "#3B82F6" },
            ]}
            onPress={handlePlaceOrder}
            disabled={!canPlace}
            activeOpacity={0.85}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={orderType === "BUY" ? "trending-up" : "trending-down"}
                  size={18}
                  color={canPlace ? "#fff" : "#444"}
                />
                <Text
                  style={[
                    styles.ctaBtnTxt,
                    { color: canPlace ? "#fff" : "#444" },
                  ]}
                >
                  {orderType === "BUY" ? "Place Buy Order" : "Place Sell Order"}
                  {qtyNum > 0 && orderTotal > 0
                    ? `  ·  ₹${orderTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                    : ""}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Create wallet modal ─────────────────────────────────────────────── */}
      <CreateWalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateWallet}
        availableBalance={demoBalance}
        loading={creatingWallet}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerSymbol: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: 0.5,
  },
  headerName: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  orderTypeToggle: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },

  // Live price bar
  priceBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  priceLabel: {
    fontSize: 10,
    color: "#94A3B8",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 2,
  },
  livePrice: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  priceChangeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1A1A24",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceChangeTxt: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Section
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 10,
    color: "#94A3B8",
    letterSpacing: 1.2,
    fontWeight: "700",
    marginBottom: 10,
  },

  // Pills (Intraday/Delivery, Market/Limit)
  pillRow: { flexDirection: "row", gap: 10 },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  pillTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },

  // Inputs
  inputRow: { flexDirection: "row", marginBottom: 20 },
  inputGroup: {},
  inputLabel: {
    fontSize: 10,
    color: "#94A3B8",
    letterSpacing: 1.2,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  // Summary card
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    marginTop: 2,
  },
  summaryKey: { fontSize: 13, color: "#777" },
  summaryVal: { fontSize: 13, color: "#1E293B", fontWeight: "600" },

  // Wallet
  noWalletBox: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#14141C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E1E28",
    gap: 8,
  },
  noWalletTxt: { fontSize: 15, color: "#AAA", fontWeight: "600" },
  noWalletSub: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 18,
  },
  createWalletBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  createWalletBtnTxt: { fontSize: 14, fontWeight: "700" },

  walletChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    marginRight: 10,
  },
  walletChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  walletChipName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  walletChipBalance: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  walletChipAdd: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 2,
    minWidth: 60,
  },
  walletChipAddTxt: {
    fontSize: 11,
    color: "#666",
  },
  walletDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  walletDetailTxt: { fontSize: 13, color: "#666" },
  insufficientTxt: { fontSize: 12, color: "#FF4444", fontWeight: "600" },

  // CTA
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  ctaBtnTxt: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: "#ffff",
  },
});
