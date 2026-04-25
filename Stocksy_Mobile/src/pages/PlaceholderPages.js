// ─────────────────────────────────────────────────────────────────────────────
// Placeholder screens for tab navigator.
// Each lives in src/pages/ — replace with real UI as you build them out.
// Named per the docs convention: PascalCase + 'Page' suffix.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const makeScreen = (label) => () => (
  <View style={styles.container}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.sub}>Coming soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  text: { fontSize: 22, fontWeight: "bold", color: "#1E293B" },
  sub: { fontSize: 14, color: "#94A3B8", marginTop: 6 },
});

export const PortfolioPage  = makeScreen("Portfolio");
export const ExchangePage   = makeScreen("Exchange");
export const MarketsPage    = makeScreen("Markets");
export const ProfilePage    = makeScreen("Profile");
