import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Ensure you have vector-icons installed

const DashboardPage = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      // Logic for logout
      navigation.replace("Login");
    } catch (_) {
      // ignore
    }
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: handleLogout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Blue Header Background */}
      <View style={styles.headerBackground} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Good Morning!</Text>
            <Text style={styles.userName}>Hi, Jessica H</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={confirmLogout} style={styles.iconButton}>
              <MaterialCommunityIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Asset Card */}
        <View style={styles.mainCard}>
          <Text style={styles.assetLabel}>Total Assets</Text>
          <View style={styles.priceRow}>
            <Text style={styles.totalAmount}>$27,170.01</Text>
            <Ionicons name="eye-outline" size={20} color="#94A3B8" style={{ marginLeft: 8 }} />
            <Text style={styles.totalChange}>▲ 3.87% (24h)</Text>
          </View>

          <View style={styles.miniCardsRow}>
            <View style={styles.miniCard}>
              <Ionicons name="logo-amazon" size={20} color="black" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.miniCardTitle}>Amazon</Text>
                <Text style={styles.miniCardSubtitle}>Amazon, Inc</Text>
              </View>
              <Text style={styles.miniCardChange}>▲ 1.76%</Text>
            </View>
            <View style={styles.miniCard}>
              <Ionicons name="logo-apple" size={20} color="black" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.miniCardTitle}>Apple</Text>
                <Text style={styles.miniCardSubtitle}>Apple, Inc</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.depositBtn}>
              <Ionicons name="add-circle-outline" size={18} color="white" />
              <Text style={styles.depositText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.withdrawBtn}>
              <Ionicons name="arrow-down-circle-outline" size={18} color="#2563EB" />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Stocks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Stocks</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>

        <View style={styles.horizontalScroll}>
          <View style={styles.stockCard}>
            <Ionicons name="logo-tableau" size={24} color="red" />
            <Text style={styles.stockCardTicker}>TSLA</Text>
            <Text style={styles.stockCardName}>Tesla, Inc.</Text>
            <Text style={styles.portfolioLabel}>Portfolio</Text>
            <View style={styles.stockPriceRow}>
              <Text style={styles.stockCardPrice}>$131.46</Text>
              <Text style={styles.stockCardChange}>▲ 2.13%</Text>
            </View>
          </View>

          <View style={styles.stockCard}>
            <Ionicons name="logo-microsoft" size={24} color="#00A4EF" />
            <Text style={styles.stockCardTicker}>MSFT</Text>
            <Text style={styles.stockCardName}>Microsoft, Co</Text>
            <Text style={styles.portfolioLabel}>Portfolio</Text>
            <Text style={styles.stockCardPrice}>$120.32</Text>
          </View>
        </View>

        {/* Watchlist */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Watchlist</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Add</Text></TouchableOpacity>
        </View>
        
        <View style={styles.watchlistItem}>
          <View style={styles.row}>
            <Ionicons name="logo-microsoft" size={24} color="#00A4EF" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.tickerText}>MSFT</Text>
              <Text style={styles.subText}>Microsoft, Corp</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.tickerText}>$716.21</Text>
            <Text style={styles.watchChange}>▲ 1.33%</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 50 },
  userName: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 15 },
  
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25,
  },
  assetLabel: { color: '#64748B', fontSize: 14, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  totalAmount: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  totalChange: { color: '#10B981', fontSize: 14, fontWeight: '600', marginLeft: 'auto' },
  
  miniCardsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  miniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
  },
  miniCardTitle: { fontSize: 12, fontWeight: 'bold' },
  miniCardSubtitle: { fontSize: 10, color: '#94A3B8' },
  miniCardChange: { fontSize: 10, color: '#10B981', marginLeft: 'auto' },

  actionRow: { flexDirection: 'row', gap: 15 },
  depositBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  depositText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  withdrawBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  withdrawText: { color: '#3B82F6', fontWeight: 'bold', marginLeft: 8 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  seeAll: { color: '#3B82F6', fontWeight: '600' },

  horizontalScroll: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  stockCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stockCardTicker: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  stockCardName: { fontSize: 12, color: '#94A3B8', marginBottom: 15 },
  portfolioLabel: { fontSize: 11, color: '#94A3B8' },
  stockCardPrice: { fontSize: 16, fontWeight: 'bold' },
  stockCardChange: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  stockPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  tickerText: { fontSize: 16, fontWeight: 'bold' },
  subText: { fontSize: 12, color: '#94A3B8' },
  watchChange: { color: '#10B981', fontSize: 12 },
});

export default DashboardPage;