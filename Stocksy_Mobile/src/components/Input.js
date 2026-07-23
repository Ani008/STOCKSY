import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

/**
 * Reusable Input Component
 * Props:
 *  - label (string): Label above the input
 *  - value (string): Controlled value
 *  - onChangeText (func): Change handler
 *  - placeholder (string)
 *  - secureTextEntry (bool): Password field
 *  - error (string): Error message below input
 *  - keyboardType (string)
 *  - autoCapitalize (string)
 *  - style (object): Extra container styles
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = "default",
  autoCapitalize = "none",
  style,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const hideText = isPassword && !showPassword;

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={hideText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={isPassword ? "password" : "off"}
          textContentType={isPassword ? "password" : "none"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
  },
  label: {
    fontSize: fontScale(Typography.caption),
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: moderateScale(6),
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: 10,
    backgroundColor: Colors.background,
    paddingHorizontal: moderateScale(14),
  },
  inputFocused: {
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: moderateScale(13),
    fontSize: fontScale(Typography.body),
    color: Colors.text,
  },
  eyeBtn: {
    paddingLeft: moderateScale(10),
    paddingVertical: moderateScale(8),
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: moderateScale(5),
    fontSize: fontScale(Typography.small),
    color: Colors.danger,
    fontWeight: "500",
  },
});

export default Input;
