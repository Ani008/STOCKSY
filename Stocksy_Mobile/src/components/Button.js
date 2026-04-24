import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

/**
 * Reusable Button Component
 * Props:
 *  - title (string): Button label
 *  - onPress (func): Press handler
 *  - loading (bool): Show spinner
 *  - disabled (bool): Disable button
 *  - variant (string): "primary" | "secondary" | "outline" | "danger"
 *  - style (object): Extra container styles
 *  - textStyle (object): Extra text styles
 */
const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[variant] || styles.primary,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    variant === "outline" ? styles.outlineText : styles.solidText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#2563EB" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  primary: {
    backgroundColor: "#2563EB",
  },
  secondary: {
    backgroundColor: "#1E40AF",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#2563EB",
  },
  danger: {
    backgroundColor: "#EF4444",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  solidText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#2563EB",
  },
});

export default Button;
