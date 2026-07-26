import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SessionExpiredScreen({ onLoginPress }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed-outline" size={34} color="#1A56DB" />
        </View>

        <Text style={styles.title}>Session expired</Text>
        <Text style={styles.subtitle}>
          For your account's security, please log back in to continue.
        </Text>

        <TouchableOpacity style={styles.button} onPress={onLoginPress}>
          <Text style={styles.buttonText}>Log in again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 260,
    marginBottom: 32,
  },
  button: {
    width: "100%",
    backgroundColor: "#1A56DB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});