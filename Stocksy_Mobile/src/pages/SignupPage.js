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

const SignupPage = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Minimum 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signup(name, email, password);
      navigation.replace('MainTabs')
    } catch (err) {
      Alert.alert("Signup Failed", err.message);
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
            <Text style={styles.title}>Create account ✨</Text>
            <Text style={styles.subtitle}>Get started for free today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
              error={errors.name}
            />
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
              placeholder="Create a password"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.btn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Login")}
            >
              Sign In
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

export default SignupPage;
