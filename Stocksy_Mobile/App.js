import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import "react-native-get-random-values";

if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.maxFontSizeMultiplier = 1.2;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.2;

import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "./src/context/ToastProvider";
import SessionExpiredScreen from "./src/components/SessionExpiredScreen";
import { registerSessionExpiredHandler } from "./services/uiBridge";

// ─── Auth screens ─────────────────────────────────────────────────────────────
import LoginPage from "./src/pages/LoginPage";
import SignupPage from "./src/pages/SignupPage";

import WalletScreen from "./src/pages/WalletScreen";
import AllTransactionsPage from "./src/pages/AllTransactionsPage";
import ForgotPasswordScreen from "./src/pages/ForgotPasswordScreen";
import SearchPage from "./src/pages/SearchPage";
import BuyOrderScreen from "./src/pages/Buyorderscreen";
import OrderSuccessScreen from "./src/pages/OrderSuccessScreen";

import StockDetailPage from "./src/pages/StockDetailPage";

// ─── Tab screens ──────────────────────────────────────────────────────────────
import DashboardPage from "./src/pages/DashboardPage";
import PortfolioPage from "./src/pages/PortfolioPage";
import MarketPage from "./src/pages/MarketPage";
import ProfilePage from "./src/pages/ProfilePage";

import { ExchangePage, MarketsPage } from "./src/pages/PlaceholderPages";

// ─── Token check ──────────────────────────────────────────────────────────────
import { getStoredToken } from "./services/authService";

// ─────────────────────────────────────────────────────────────────────────────
// Tab icon map
// ─────────────────────────────────────────────────────────────────────────────
const TAB_ICONS = {
  Home: { active: "home", inactive: "home-outline" },
  Portfolio: { active: "briefcase", inactive: "briefcase-outline" },
  Exchange: { active: "swap-horizontal", inactive: "swap-horizontal-outline" },
  Markets: { active: "bar-chart", inactive: "bar-chart-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Tab Navigator — shown for all authenticated screens
// ─────────────────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#F1F5F9",
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 12,
          // Shadow for iOS
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -3 },
          // Elevation for Android
          elevation: 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardPage} />
      <Tab.Screen name="Portfolio" component={PortfolioPage} />
      <Tab.Screen name="Markets" component={MarketPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Stack — Login/Signup sit outside the tab navigator so the tab bar
// never appears on auth screens. navigation.replace('MainTabs') after login
// removes auth screens from the stack entirely.
// ─────────────────────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();

export default function App() {
  // null = still checking, true = has token, false = no token
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getStoredToken();
      setIsAuthenticated(!!token);
    };
    checkToken();
  }, []);

  // Registered once — api.js's interceptor calls triggerSessionExpired()
  // from outside the React tree whenever any request comes back 401
  // SESSION_EXPIRED. This is the only place that reacts to it.
  useEffect(() => {
    registerSessionExpiredHandler(() => setSessionExpired(true));
  }, []);

  const handleReLogin = () => {
    // Token's already cleared by the interceptor at the point of
    // failure. Flipping both flags here forces a full remount of the
    // NavigationContainer below with initialRouteName freshly
    // evaluated as "Login" — same mechanism the app already uses for
    // the normal logged-out state.
    setSessionExpired(false);
    setIsAuthenticated(false);
  };

  // ── Splash / loading state ──────────────────────────────────────────────────
  // Shown for the fraction of a second while SecureStore is read.
  // Prevents a flash of the Login screen for already-logged-in users.
  if (isAuthenticated === null) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (sessionExpired) {
    return (
      <SafeAreaProvider>
        <SessionExpiredScreen onLoginPress={handleReLogin} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName={isAuthenticated ? "MainTabs" : "Login"}
          screenOptions={{ headerShown: false }}
        >
          {/* ── Auth screens (no tab bar) ──────────────────────────────────── */}
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Signup" component={SignupPage} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />

          {/* ── Authenticated shell (tab bar lives inside here) ────────────── */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="AllTransactions" component={AllTransactionsPage} />

          <Stack.Screen name="Search" component={SearchPage} />
          <Stack.Screen name="StockDetail" component={StockDetailPage} />
          <Stack.Screen name="BuyOrder" component={BuyOrderScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});