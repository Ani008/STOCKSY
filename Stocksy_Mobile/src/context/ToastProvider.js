import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { registerToastHandler } from "../../services/uiBridge";

const AUTO_DISMISS_MS = 4500;

const SEVERITY_CONFIG = {
  success: { border: "#059669", iconBg: "#059669", icon: "checkmark" },
  warning: { border: "#D97706", iconBg: "#D97706", icon: "warning-outline" },
  error: { border: "#DC2626", iconBg: "#DC2626", icon: "alert-circle-outline" },
};
let idCounter = 0;

function ToastItem({ toast, onDismiss }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const config = SEVERITY_CONFIG[toast.severity] || SEVERITY_CONFIG.error;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onDismiss(toast.id));
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onDismiss(toast.id));
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        { borderLeftColor: config.border, opacity },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
        <Ionicons name={config.icon} size={13} color="#fff" />
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={handleDismiss} hitSlop={10}>
        <Ionicons name="close" size={16} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, severity = "error") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, severity }]);
  }, []);

  useEffect(() => {
    registerToastHandler(show);
  }, [show]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <View
        style={[styles.container, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    gap: 10,
  },
  toast: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13.5,
    fontWeight: "500",
  },
});