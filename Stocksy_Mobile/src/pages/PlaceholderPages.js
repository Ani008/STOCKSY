// ─────────────────────────────────────────────────────────────────────────────
// Placeholder screens for tab navigator.
// Each lives in src/pages/ — replace with real UI as you build them out.
// Named per the docs convention: PascalCase + 'Page' suffix.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, fontScale, moderateScale } from "../theme";

const makeScreen = (label) => () => (
  <View style={styles.container}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.sub}>Coming soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  text: { fontSize: fontScale(22), fontWeight: "bold", color: Colors.text },
  sub: { fontSize: fontScale(14), color: Colors.textMuted, marginTop: moderateScale(6) },
});

export const PortfolioPage  = makeScreen("Portfolio");
export const ExchangePage   = makeScreen("Exchange");
export const MarketsPage    = makeScreen("Markets");
export const ProfilePage    = makeScreen("Profile");
