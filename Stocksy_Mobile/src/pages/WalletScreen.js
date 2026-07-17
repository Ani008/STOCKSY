import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../components/Button";
import WalletCard from "../components/WalletCard";
import CreateWalletModal from "../components/CreateWalletModal";
import DemoCard, { CARD_SKINS } from "../components/DemoCard";
import CardCustomizerModal from "../components/Cardcustomizermodal";
import Dashboard from "./DashboardPage";
import {
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from "../../services/walletService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Palette for sub-wallet icon colours
const WALLET_COLORS = [
  "#00D09C",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
];

const WALLET_ICONS = [
  "trending-up-outline",
  "briefcase-outline",
  "rocket-outline",
  "shield-checkmark-outline",
  "bar-chart-outline",
  "diamond-outline",
];

const SKIN_STORAGE_KEY = "@stocksy_card_skin";

const WalletScreen = ({ navigation }) => {
  const [demoBalance, setDemoBalance] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [skinModalVisible, setSkinModalVisible] = useState(false);
  const [activeSkin, setActiveSkin] = useState(CARD_SKINS[0]);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;

  // Load saved skin on mount
  useEffect(() => {
    const loadSkin = async () => {
      try {
        const saved = await AsyncStorage.getItem(SKIN_STORAGE_KEY);
        if (saved) {
          const skinObj = CARD_SKINS.find((s) => s.id === saved);
          if (skinObj) setActiveSkin(skinObj);
        }
      } catch (_) {}
    };
    loadSkin();
  }, []);

  // Entrance animations
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 450,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // ─── Fetch wallets ───────────────────────────────────────────────────
  const loadWallets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchWallets();
      setDemoBalance(data.demoBalance);
      setWallets(data.wallets);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to load wallet data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  // ─── Create wallet ───────────────────────────────────────────────────
  const handleCreateWallet = async ({ name, amount }) => {
    setCreating(true);
    try {
      const data = await createWallet({ name, amount });
      setDemoBalance(data.demoBalance);
      setWallets(data.wallets);
      setModalVisible(false);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not create wallet.",
      );
    } finally {
      setCreating(false);
    }
  };

  // ─── Rename wallet ───────────────────────────────────────────────────
  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || !selectedWallet) return;
    try {
      await updateWallet({
        walletId: selectedWallet.id,
        name: renameValue.trim(),
      });
      setRenameModalVisible(false);
      setSelectedWallet(null);
      loadWallets();
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Could not rename wallet.",
      );
    }
  };

  // ─── Delete wallet ───────────────────────────────────────────────────
  const handleDeleteWallet = async (wallet) => {
    Alert.alert(
      "Delete Wallet",
      `Delete "${wallet.name}"?\n\n₹${formatINR(wallet.balance)} will be refunded to your available balance.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const data = await deleteWallet(wallet.id);
              setWallets(data.wallets);
              loadWallets();
            } catch (err) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Could not delete wallet.",
              );
            }
          },
        },
      ],
    );
  };

  // ─── Wallet actions menu ─────────────────────────────────────────────
  const handleWalletActions = (wallet) => {
    Alert.alert(wallet.name, "What would you like to do?", [
      {
        text: "Rename",
        onPress: () => {
          setSelectedWallet(wallet);
          setRenameValue(wallet.name);
          setRenameModalVisible(true);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteWallet(wallet),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ─── Save skin ───────────────────────────────────────────────────────
  const handleSelectSkin = async (skin) => {
    setActiveSkin(skin);
    try {
      await AsyncStorage.setItem(SKIN_STORAGE_KEY, skin.id);
    } catch (_) {}
  };

  // ─── Derived values ──────────────────────────────────────────────────
  const totalAllocated = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const allocatedPct =
    demoBalance > 0
      ? Math.round((totalAllocated / (demoBalance + totalAllocated)) * 100)
      : 0;

  const formatINR = (value) =>
    Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D09C" />
        <Text style={styles.loadingText}>Loading wallet…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />

      {/* ── Header ────────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Wallet</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("AllTransactions")}
          style={styles.headerBtn}
        >
          <Ionicons name="time-outline" size={20} color="#1E293B" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadWallets(true)}
            tintColor="#00D09C"
          />
        }
      >
        {/* ── Card Section ──────────────────────────────────────────── */}
        <View style={styles.cardSection}>
          {/* Action column */}
          <View style={styles.actionColumn}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={22} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Create</Text>


            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Dashboard")}>
              <Ionicons name="arrow-up-outline" size={20} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Invest</Text>


            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="receipt-outline" size={20} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Transactions</Text>
          </View>

          {/* Card stack */}
          <View style={styles.cardStackArea}>
            <View style={[styles.stackShadow2]} />
            <View style={[styles.stackShadow1]} />

            <Animated.View style={{ transform: [{ scale: cardScale }] }}>
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => setSkinModalVisible(true)}
              >
                <DemoCard balance={demoBalance} skin={activeSkin} />
                {/* Edit hint */}
                <View style={styles.editHint}>
                  <Ionicons
                    name="color-palette-outline"
                    size={12}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.editHintText}>Tap to customise</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* ── Balance Breakdown ─────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.balanceBreakdown,
            { transform: [{ translateY: contentTranslate }] },
          ]}
        >
          <View style={styles.breakdownItem}>
            <View style={[styles.breakDot, { backgroundColor: "#00D09C" }]} />
            <View>
              <Text style={styles.breakLabel}>Available</Text>
              <Text style={styles.breakValue}>₹{formatINR(demoBalance)}</Text>
            </View>
          </View>

          <View style={styles.breakDivider} />

          <View style={styles.breakdownItem}>
            <View style={[styles.breakDot, { backgroundColor: "#3B82F6" }]} />
            <View>
              <Text style={styles.breakLabel}>Allocated</Text>
              <Text style={styles.breakValue}>
                ₹{formatINR(totalAllocated)}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarOuter}>
            <View
              style={[styles.progressBarInner, { width: `${allocatedPct}%` }]}
            />
          </View>
        </Animated.View>

        {/* ── Sub-wallets ───────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.section,
            { transform: [{ translateY: contentTranslate }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sub Wallets</Text>
          </View>

          {wallets.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconRing}>
                <Ionicons name="wallet-outline" size={28} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No sub Wallets yet</Text>
              <Text style={styles.emptySubtitle}>
                Create wallets to allocate funds for different strategies.
              </Text>
            </View>
          ) : (
            wallets.map((wallet, index) => (
              <WalletCard
                key={wallet._id || wallet.id || index}
                name={wallet.name}
                balance={wallet.balance}
                iconName={WALLET_ICONS[index % WALLET_ICONS.length]}
                iconColor={WALLET_COLORS[index % WALLET_COLORS.length]}
                onPressActions={() => handleWalletActions(wallet)}
              />
            ))
          )}
        </Animated.View>

        {/* ── Transactions ──────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.section,
            { transform: [{ translateY: contentTranslate }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>

          </View>

          <View style={styles.emptyTransactions}>
            <View style={styles.emptyIconRing}>
              <Ionicons name="receipt-outline" size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transfers and payments will appear here.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addMoneyBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#3B82F6", "#3B82F6"]}
            style={styles.addMoneyGradient}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <CreateWalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateWallet}
        availableBalance={demoBalance}
        loading={creating}
      />

      <CardCustomizerModal
        visible={skinModalVisible}
        onClose={() => setSkinModalVisible(false)}
        currentSkinId={activeSkin.id}
        balance={demoBalance}
        onSelectSkin={handleSelectSkin}
      />

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.renameOverlay}>
          <View style={styles.renameSheet}>
            <Text style={styles.renameTitle}>Rename Wallet</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Wallet name"
              placeholderTextColor="#94A3B8"
              style={styles.renameInput}
              autoFocus
            />
            <View style={styles.renameActions}>
              <TouchableOpacity
                onPress={() => setRenameModalVisible(false)}
                style={styles.renameCancelBtn}
              >
                <Text style={styles.renameCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRenameSubmit}
                style={styles.renameSaveBtn}
              >
                <Text style={styles.renameSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#F7F8FA",
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: 0.2,
  },

  // Scroll
  scrollContent: {
    paddingTop: 8,
  },

  // Card section
  cardSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  actionColumn: {
    width: 68,
    alignItems: "center",
    marginRight: 4,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 6,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  cardStackArea: {
    position: "relative",
    width: 310,
    height: 210,
    marginLeft: 16,
  },
  stackShadow1: {
    position: "absolute",
    width: 280,
    height: 170,
    borderRadius: 22,
    backgroundColor: "#CBD5E1",
    top: 12,
    left: 18,
    transform: [{ rotate: "-9deg" }],
    opacity: 0.7,
  },
  stackShadow2: {
    position: "absolute",
    width: 265,
    height: 165,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    top: 18,
    left: 22,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.5,
  },
  editHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  editHintText: {
    fontSize: 11,
    color: "rgba(100,116,139,0.7)",
    fontWeight: "500",
  },

  // Balance breakdown
  balanceBreakdown: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    flexWrap: "wrap",
    gap: 4,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  breakDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  breakValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  breakDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 8,
  },
  progressBarOuter: {
    width: "100%",
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
    marginTop: 14,
    overflow: "hidden",
  },
  progressBarInner: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
  },

  // Section
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: 0.1,
  },
  addWalletBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addWalletText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00D09C",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },

  // Empty states
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderStyle: "dashed",
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    gap: 8,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "rgba(247,248,250,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  addMoneyBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addMoneyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  addMoneyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Rename modal
  renameOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  renameSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  renameInput: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  renameCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  renameCancelText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  renameSaveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#1E293B",
  },
  renameSaveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default WalletScreen;
