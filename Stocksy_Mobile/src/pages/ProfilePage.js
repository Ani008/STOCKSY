import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ProfilePage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem("user");

      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");

          await AsyncStorage.removeItem("user");

          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */} <Text style={styles.title}>Profile </Text>
        ```
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                "https://ui-avatars.com/api/?name=" +
                (user?.username || "Trader"),
            }}
            style={styles.avatar}
          />

          <View style={styles.nameRow}>
            <Text style={styles.name}>{user?.username || "Trader"}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ Paper Trader</Text>
            </View>
          </View>

          <Text style={styles.email}>{user?.email || "user@email.com"}</Text>
        </View>
        {/* Trading */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("OrderHistory")}
        >
          <View style={styles.cardLeft}>
            <Ionicons name="bar-chart" size={22} color="#2563EB" />

            <View>
              <Text style={styles.cardTitle}>Trading</Text>

              <Text style={styles.cardSub}>Order History</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
        {/* Analytics */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("TradingStatistics")}
        >
          <View style={styles.cardLeft}>
            <MaterialCommunityIcons
              name="chart-line"
              size={22}
              color="#10B981"
            />

            <View>
              <Text style={styles.cardTitle}>Analytics</Text>

              <Text style={styles.cardSub}>Trading Statistics</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
        {/* About */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setAboutExpanded(!aboutExpanded)}
        >
          <View style={styles.cardLeft}>
            <Ionicons name="information-circle" size={22} color="#F59E0B" />

            <Text style={styles.cardTitle}>About</Text>
          </View>

          <Ionicons
            name={aboutExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>
        {aboutExpanded && (
          <View style={styles.aboutContent}>
            <Text style={styles.aboutText}>Stocksy v1.0</Text>

            <Text style={styles.aboutText}>
              Real-time Paper Trading Platform
            </Text>

            <Text style={styles.aboutText}>• OMS Engine</Text>

            <Text style={styles.aboutText}>• Live Market Data</Text>

            <Text style={styles.aboutText}>• Portfolio Tracking</Text>

            <Text style={styles.aboutText}>• Redis Streaming</Text>

            <Text style={styles.aboutText}>• PostgreSQL Storage</Text>

            <Text
              style={[
                styles.aboutText,
                {
                  marginTop: 10,
                },
              ]}
            >
              Developed by Aniket
            </Text>
          </View>
        )}
        {/* Logout */}
        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />

          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scroll: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 20,
  },

  profileCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },

  badge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 12,
  },

  email: {
    color: "#64748B",
    fontSize: 14,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  cardSub: {
    fontSize: 12,
    color: "#64748B",
  },

  aboutContent: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  aboutText: {
    color: "#475569",
    marginBottom: 6,
    lineHeight: 22,
  },

  logoutCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,

    marginTop: 10,
  },

  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ProfilePage;
