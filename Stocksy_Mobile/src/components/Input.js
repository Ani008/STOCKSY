import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

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
          placeholderTextColor="#94A3B8"
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
            <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1E293B",
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  eyeText: {
    fontSize: 16,
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
});

export default Input;
