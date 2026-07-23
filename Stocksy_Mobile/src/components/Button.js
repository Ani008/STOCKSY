import React from "react";
import { Colors, Typography, fontScale, moderateScale } from "../theme";

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
          color={variant === "outline" ? Colors.primaryDark : Colors.white}
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
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(24),
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  primary: {
    backgroundColor: Colors.primaryDark,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: fontScale(Typography.body),
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  solidText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primaryDark,
  },
});

export default Button;
