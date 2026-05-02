import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import Button from "../components/Button";
import Input from "../components/Input";
import authService from "../../services/authService";

// Complete any pending auth sessions (required for web)
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client ID — replace with your own from Google Cloud Console
const GOOGLE_CLIENT_ID = "528080114266-dddb4f6mdjucn26iu1i8b3ctmrf9qs5f.apps.googleusercontent.com";
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Google OAuth ────────────────────────────────────────────────────────
  const redirectUri = AuthSession.makeRedirectUri({ preferLocalhost: true });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Token,
      prompt: AuthSession.Prompt.SelectAccount, // forces account picker
      usePKCE: false, // Google implicit flow doesn't support PKCE
    },
    GOOGLE_DISCOVERY
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      // Fetch user info from Google
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
        .then((res) => res.json())
        .then((userInfo) => {
          // You can send userInfo to your backend here
          navigation.replace("MainTabs");
        })
        .catch(() => Alert.alert("Google Sign-In", "Failed to get user info."));
    } else if (response?.type === "error") {
      Alert.alert("Google Sign-In", response.error?.message || "Something went wrong.");
    }
  }, [response]);

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
            <Text style={styles.title}>Welcome back</Text>
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

            {/* ── Forgot Password ─────────────────────────────────────── */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
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

          {/* ── Divider ────────────────────────────────────────────── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Google Sign-In ─────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.8}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <Svg width={20} height={20} viewBox="0 0 48 48" style={styles.googleLogo}>
              <G>
                <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <Path fill="none" d="M0 0h48v48H0z" />
              </G>
            </Svg>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
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

  // Google Sign-In button
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginTop: 4,
    minHeight: 50,
  },
  googleLogo: { marginRight: 10 },
  googleBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },

  // Forgot Password
  forgotBtn: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotText: {
    fontSize: 14,
    color: "#64748B",
  },
});

export default LoginPage;
