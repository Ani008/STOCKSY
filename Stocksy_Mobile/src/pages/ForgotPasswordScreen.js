import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api"; // Adjust the import path based on your project structure
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Colors (matching existing app palette) ─────────────────────────────────
const BLUE = "#2563EB";
const DARK = "#1E293B";
const MUTED = "#64748B";
const BORDER = "#CBD5E1";
const BG = "#F8FAFC";
const ERROR = "#EF4444";
const GREEN = "#16A34A";
const WHITE = "#FFFFFF";

// ── Step constants ─────────────────────────────────────────────────────────
const STEP_EMAIL = "email";
const STEP_OTP = "otp";
const STEP_RESET = "reset";
const STEP_SUCCESS = "success";

const OTP_RESEND_SECONDS = 30;

// ─────────────────────────────────────────────────────────────────────────────
// ForgotPasswordScreen
// Navigation: registered as 'ForgotPassword' in App.js (auth stack)
// ─────────────────────────────────────────────────────────────────────────────
const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(STEP_EMAIL);

  // Step 1 — email/mobile
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState("");

  // Step 2 — OTP
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Step 3 — reset
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [resetErrors, setResetErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Toast
  const toastAnim = useRef(new Animated.Value(0)).current;

  // ── OTP Countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== STEP_OTP) return;
    setCountdown(OTP_RESEND_SECONDS);
    setCanResend(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // ── Toast animation ───────────────────────────────────────────────────────
  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => navigation.replace("Login"));
  };

  // ── Step 1: Validate email/mobile ─────────────────────────────────────────
  const handleSendOtp = async () => {
    const emailRegex = /\S+@\S+\.\S+/;

    if (!contact.trim()) {
      setContactError("Email is required");
      return;
    }

    if (!emailRegex.test(contact)) {
      setContactError("Enter a valid email");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password/send-otp", {
        email: contact.trim().toLowerCase(),
      });

      setLoading(false);

      if (response.data.success) {
        setContactError("");
        setStep(STEP_OTP);
      }
    } catch (err) {
      setLoading(false);

      setContactError(err.response?.data?.message || "Unable to send OTP.");
    }
  };

  // ── Step 2: OTP input handlers ────────────────────────────────────────────
  const handleOtpChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      setOtpError("Enter all 4 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password/verify-otp", {
        email: contact.trim().toLowerCase(),
        otp: enteredOtp,
      });

      setLoading(false);

      if (response.data.success) {
        setOtpError("");
        setStep(STEP_RESET);
      }
    } catch (err) {
      setLoading(false);

      setOtpError(err.response?.data?.message || "Invalid OTP.");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await api.post("/auth/forgot-password/send-otp", {
        email: contact.trim().toLowerCase(),
      });

      setOtp(["", "", "", ""]);
      setOtpError("");
      setStep(STEP_OTP);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Unable to resend OTP.");
    }
  };

  // ── Step 3: Reset password ────────────────────────────────────────────────
  const handleReset = async () => {
    const errs = {};

    if (!newPass) {
      errs.newPass = "New password is required";
    } else if (newPass.length < 6) {
      errs.newPass = "Minimum 6 characters";
    }

    if (!confirmPass) {
      errs.confirmPass = "Please confirm your password";
    } else if (newPass !== confirmPass) {
      errs.confirmPass = "Passwords do not match";
    }

    setResetErrors(errs);

    if (Object.keys(errs).length) return;

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password/reset-password", {
        email: contact.trim().toLowerCase(),
        otp: otp.join(""),
        password: newPass,
      });

      setLoading(false);

      if (response.data.success) {
        setStep(STEP_SUCCESS);
        showToast();
      }
    } catch (err) {
      setLoading(false);

      alert(err.response?.data?.message || "Unable to reset password.");
    }
  };

  // ── Back handler ──────────────────────────────────────────────────────────
  const handleBack = () => {
    if (step === STEP_EMAIL) {
      navigation.goBack();
      return;
    }
    if (step === STEP_OTP) {
      setStep(STEP_EMAIL);
      return;
    }
    if (step === STEP_RESET) {
      setStep(STEP_OTP);
      return;
    }
  };

  // ── Step title helpers ────────────────────────────────────────────────────
  const stepTitle = {
    [STEP_EMAIL]: "Forgot Password?",
    [STEP_OTP]: "Enter OTP",
    [STEP_RESET]: "Reset Password",
    [STEP_SUCCESS]: "All Done!",
  }[step];

  const stepSubtitle = {
    [STEP_EMAIL]: "Enter your registered email or mobile number.",
    [STEP_OTP]: `We sent a 4-digit code to ${contact}.`,
    [STEP_RESET]: "Choose a new password for your account.",
    [STEP_SUCCESS]: "Your password has been reset successfully.",
  }[step];

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
          {/* Back button */}
          {step !== STEP_SUCCESS && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>Stocksy</Text>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.subtitle}>{stepSubtitle}</Text>
          </View>

          {/* ── STEP 1: Email / Mobile ─────────────────────────────────── */}
          {step === STEP_EMAIL && (
            <View style={styles.form}>
              <Input
                label="Email or Mobile Number"
                value={contact}
                onChangeText={(t) => {
                  setContact(t);
                  setContactError("");
                }}
                placeholder="you@example.com or 9876543210"
                keyboardType="email-address"
                error={contactError}
              />
              <Button
                title="Send OTP"
                onPress={handleSendOtp}
                style={styles.btn}
              />
            </View>
          )}

          {/* ── STEP 2: OTP ───────────────────────────────────────────── */}
          {step === STEP_OTP && (
            <View style={styles.form}>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={otpRefs[i]}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    value={digit}
                    onChangeText={(t) => handleOtpChange(t, i)}
                    onKeyPress={(e) => handleOtpKeyPress(e, i)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    autoFocus={i === 0}
                  />
                ))}
              </View>
              {otpError ? (
                <Text style={styles.errorText}>{otpError}</Text>
              ) : null}

              {/* Resend row */}
              <View style={styles.resendRow}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendTimer}>
                    Resend in{" "}
                    <Text style={styles.resendBlue}>{countdown}s</Text>
                  </Text>
                )}
              </View>

              <Button
                title="Verify OTP"
                onPress={handleVerifyOtp}
                style={styles.btn}
              />
            </View>
          )}

          {/* ── STEP 3: Reset Password ─────────────────────────────────── */}
          {step === STEP_RESET && (
            <View style={styles.form}>
              <Input
                label="New Password"
                value={newPass}
                onChangeText={(t) => {
                  setNewPass(t);
                  setResetErrors((e) => ({ ...e, newPass: "" }));
                }}
                placeholder="Min. 6 characters"
                secureTextEntry
                error={resetErrors.newPass}
              />
              <Input
                label="Confirm Password"
                value={confirmPass}
                onChangeText={(t) => {
                  setConfirmPass(t);
                  setResetErrors((e) => ({ ...e, confirmPass: "" }));
                }}
                placeholder="Re-enter your password"
                secureTextEntry
                error={resetErrors.confirmPass}
              />
              <Button
                title="Reset Password"
                onPress={handleReset}
                loading={loading}
                style={styles.btn}
              />
            </View>
          )}

          {/* ── STEP 4: Success placeholder (toast handles navigation) ── */}
          {step === STEP_SUCCESS && (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>Redirecting you to login…</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Success Toast ───────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>🎉 Password reset successfully!</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },

  // Back button
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  backArrow: { fontSize: 18, color: BLUE, marginRight: 4 },
  backText: { fontSize: 14, color: BLUE, fontWeight: "600" },

  // Header (mirrors LoginPage)
  header: { marginBottom: 36 },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: BLUE,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: DARK,
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: MUTED },

  // Form
  form: { marginBottom: 24 },
  btn: { marginTop: 8 },

  // OTP boxes
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  otpBox: {
    width: 64,
    height: 64,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    fontSize: 24,
    fontWeight: "700",
    color: DARK,
    backgroundColor: WHITE,
  },
  otpBoxFilled: {
    borderColor: BLUE,
    backgroundColor: "#EFF6FF",
  },
  errorText: {
    fontSize: 12,
    color: ERROR,
    fontWeight: "500",
    marginBottom: 8,
  },

  // Resend
  resendRow: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  resendTimer: { fontSize: 13, color: MUTED },
  resendBlue: { color: BLUE, fontWeight: "600" },
  resendLink: { fontSize: 13, color: BLUE, fontWeight: "600" },

  // Success
  successBox: {
    alignItems: "center",
    paddingVertical: 48,
  },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successText: { fontSize: 15, color: MUTED, textAlign: "center" },

  // Toast
  toast: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  toastText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
