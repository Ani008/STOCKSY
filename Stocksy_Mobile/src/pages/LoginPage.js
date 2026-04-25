import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import authService from "../../services/authService";

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Minimum 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.login(email, password);
      navigation.replace('MainTabs')
    } catch (err) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>Stocksy</Text>
            <Text style={styles.title}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.btn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Signup")}
            >
              Sign Up
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { marginBottom: 36 },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: "#64748B" },
  form: { marginBottom: 24 },
  btn: { marginTop: 8 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { fontSize: 14, color: "#64748B" },
  link: { fontSize: 14, color: "#2563EB", fontWeight: "600" },
});

export default LoginPage;
