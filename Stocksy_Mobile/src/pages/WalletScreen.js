import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import WalletCard from "../components/WalletCard";
import CreateWalletModal from "../components/CreateWalletModal";
import {
  fetchWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from "../../services/walletService";

// Palette of icon colours — each new wallet gets the next colour in rotation
const WALLET_COLORS = [
  "#00D09C",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
];

const WalletScreen = ({ navigation }) => {
  const [demoBalance, setDemoBalance] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // ─── Fetch wallets from API ──────────────────────────────────────────
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
      // Update state from server response — single source of truth
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

  const handleRenameWallet = async (walletId, currentName) => {
    Alert.prompt(
      "Rename Wallet",
      "Enter new wallet name",
      async (newName) => {
        if (!newName?.trim()) return;

        try {
          await updateWallet({
            walletId,
            name: newName,
          });

          loadWallets();
        } catch (err) {
          Alert.alert(
            "Error",
            err?.response?.data?.message || "Could not update wallet.",
          );
        }
      },
      "plain-text",
      currentName,
    );
  };

  const handleDeleteWallet = async (wallet) => {
    Alert.alert(
      "Delete Wallet",
      `Delete "${wallet.name}"?\n\n₹${formatINR(wallet.balance)} will be refunded back to your available balance.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || !selectedWallet) {
      return;
    }

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

  // ─── Derived values ──────────────────────────────────────────────────
  const totalAllocated = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  const formatINR = (value) =>
    Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  // ─── Render ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00D09C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AllTransactions")}
        >
          <Text style={styles.allTransactions}>All transactions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadWallets(true)}
            tintColor="#00D09C"
          />
        }
      >
        {/* Main Demo Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.cardLabel}>Total Capital</Text>
          <Text style={styles.mainBalance}>
            ₹{formatINR(demoBalance + totalAllocated)}
          </Text>

          <View style={styles.dashedLine} />

          {/* Available vs Allocated split */}
          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: "#00D09C" }]} />
              <View>
                <Text style={styles.splitLabel}>Available Balance</Text>
                <Text style={styles.splitValue}>₹{formatINR(demoBalance)}</Text>
              </View>
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: "#3B82F6" }]} />
              <View>
                <Text style={styles.splitLabel}>Allocated to Wallets</Text>
                <Text style={styles.splitValue}>
                  ₹{formatINR(totalAllocated)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wallets Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            My Wallets {wallets.length > 0 ? `(${wallets.length})` : ""}
          </Text>
        </View>

        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No wallets yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Add money" below to create your first trading wallet.
            </Text>
          </View>
        ) : (
          wallets.map((wallet, index) => (
            <View key={wallet.id}>
              <WalletCard
                key={wallet.id}
                name={wallet.name}
                balance={Number(wallet.balance)}
                iconColor={WALLET_COLORS[index % WALLET_COLORS.length]}
                onPressActions={() => {
                  Alert.alert(wallet.name, "Choose an action", [
                    {
                      text: "Rename Wallet",
                      onPress: () => {
                        setSelectedWallet(wallet);
                        setRenameValue(wallet.name);
                        setRenameModalVisible(true);
                      },
                    },
                    {
                      text: "Delete Wallet",
                      style: "destructive",
                      onPress: () => handleDeleteWallet(wallet),
                    },
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                  ]);
                }}
              />
            </View>
          ))
        )}

        {/* Bottom padding so content clears the fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Money Button (pinned to bottom) */}
      <View style={styles.bottomActions}>
        <Button
          title="Add money"
          variant="primary"
          style={styles.flexBtn}
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Create Wallet Modal */}
      <CreateWalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateWallet}
        availableBalance={demoBalance}
        loading={creating}
      />

      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 16,
                color: "#1E293B",
              }}
            >
              Rename Wallet
            </Text>

            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Wallet name"
              placeholderTextColor="#94A3B8"
              style={{
                borderWidth: 1,
                borderColor: "#E2E8F0",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: "#1E293B",
                marginBottom: 20,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <TouchableOpacity onPress={() => setRenameModalVisible(false)}>
                <Text
                  style={{
                    color: "#64748B",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRenameSubmit}>
                <Text
                  style={{
                    color: "#00D09C",
                    fontWeight: "700",
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  allTransactions: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
    textDecorationLine: "underline",
  },

  // Scroll
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Balance Card
  balanceCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
    // Subtle shadow
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    marginBottom: 8,
  },
  mainBalance: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginVertical: 20,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  splitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  splitLabel: { fontSize: 12, color: "#94A3B8", marginBottom: 2 },
  splitValue: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  splitDivider: { width: 1, height: 30, backgroundColor: "#E2E8F0" },

  // Section
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Bottom CTA
  bottomActions: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 28,
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  flexBtn: { flex: 1 },
});

export default WalletScreen;
