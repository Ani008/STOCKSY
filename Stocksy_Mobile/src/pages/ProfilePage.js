import React, { useEffect, useState } from "react";
import {
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

  
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

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
            <Ionicons name="bar-chart" size={22} color={Colors.primaryDark} />

            <View>
              <Text style={styles.cardTitle}>Trading</Text>

              <Text style={styles.cardSub}>Order History</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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
              color={Colors.success}
            />

            <View>
              <Text style={styles.cardTitle}>Analytics</Text>

              <Text style={styles.cardSub}>Trading Statistics</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        {/* About */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setAboutExpanded(!aboutExpanded)}
        >
          <View style={styles.cardLeft}>
            <Ionicons name="information-circle" size={22} color={Colors.warning} />

            <Text style={styles.cardTitle}>About</Text>
          </View>

          <Ionicons
            name={aboutExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors.textMuted}
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
                  marginTop: moderateScale(10),
                },
              ]}
            >
              Developed by Aniket
            </Text>
          </View>
        )}
        {/* Logout */}
        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color={Colors.danger} />

          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scroll: {
    padding: moderateScale(20),
    paddingBottom: moderateScale(50),
  },

  title: {
    fontSize: fontScale(Typography.h1),
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: moderateScale(20),
  },

  profileCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: moderateScale(24),
    alignItems: "center",
    marginBottom: moderateScale(24),

    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: moderateScale(16),
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    marginBottom: moderateScale(6),
  },

  name: {
    fontSize: fontScale(Typography.h2),
    fontWeight: "bold",
    color: Colors.text,
  },

  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: 999,
  },

  badgeText: {
    color: Colors.primaryDark,
    fontWeight: "600",
    fontSize: fontScale(Typography.small),
  },

  email: {
    color: Colors.textSecondary,
    fontSize: fontScale(14),
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: moderateScale(18),
    marginBottom: moderateScale(14),

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },

  cardTitle: {
    fontSize: fontScale(Typography.bodyLarge),
    fontWeight: "700",
    color: Colors.text,
  },

  cardSub: {
    fontSize: fontScale(Typography.small),
    color: Colors.textSecondary,
  },

  aboutContent: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: moderateScale(18),
    marginBottom: moderateScale(14),
  },

  aboutText: {
    color: Colors.textSecondary,
    marginBottom: moderateScale(6),
    lineHeight: 22,
  },

  logoutCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: moderateScale(18),

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(10),

    marginTop: moderateScale(10),
  },

  logoutText: {
    color: Colors.danger,
    fontWeight: "700",
    fontSize: fontScale(Typography.bodyLarge),
  },
});

export default ProfilePage;
