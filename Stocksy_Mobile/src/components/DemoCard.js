import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

/**
 * DemoCard
 * A premium visual card component that renders the main demo balance card.
 * Supports multiple skins via the `skin` prop.
 *
 * Props:
 * @param {number} balance    - Demo balance as number
 * @param {string} cardNumber - Masked card number string e.g. "5292 •••• •••• 3123"
 * @param {object} skin       - Skin object from CARD_SKINS
 * @param {object} [style]    - Extra styles for the outer wrapper
 */

export const CARD_SKINS = [
  {
    id: "obsidian",
    label: "Obsidian",
    colors: ["#0F0F0F", "#1A1A2E", "#16213E"],
    accentColor: Colors.gain,
    textColor: Colors.white,
    subTextColor: "rgba(255,255,255,0.55)",
    chipColor: Colors.gain,
    logoLeft: Colors.danger,
    logoRight: Colors.warning,
  },
  {
    id: "midnight",
    label: "Midnight",
    colors: ["#0D1B2A", "#1B2838", "#162032"],
    accentColor: Colors.primaryAccent,
    textColor: Colors.white,
    subTextColor: "rgba(255,255,255,0.5)",
    chipColor: Colors.primaryAccent,
    logoLeft: Colors.primaryAccent,
    logoRight: "#A78BFA",
  },
  {
    id: "aurora",
    label: "Aurora",
    colors: ["#064E3B", "#065F46", "#047857"],
    accentColor: Colors.gain,
    textColor: Colors.white,
    subTextColor: "rgba(255,255,255,0.55)",
    chipColor: Colors.gain,
    logoLeft: Colors.gain,
    logoRight: Colors.success,
  },
  {
    id: "ember",
    label: "Ember",
    colors: ["#1C0A00", "#3B1503", "#78350F"],
    accentColor: Colors.warning,
    textColor: Colors.white,
    subTextColor: "rgba(255,255,255,0.5)",
    chipColor: Colors.warning,
    logoLeft: Colors.danger,
    logoRight: Colors.warning,
  },
  {
    id: "frost",
    label: "Frost",
    colors: [Colors.primaryLight, Colors.primaryLight, Colors.primaryLight],
    accentColor: Colors.primaryDark,
    textColor: Colors.text,
    subTextColor: "rgba(30,41,59,0.5)",
    chipColor: Colors.primaryDark,
    logoLeft: Colors.primary,
    logoRight: Colors.primaryAccent,
  },
  {
    id: "rose",
    label: "Rose Gold",
    colors: ["#1A0A0F", "#2D1520", "#3D1A2A"],
    accentColor: "#F9A8D4",
    textColor: Colors.white,
    subTextColor: "rgba(255,255,255,0.5)",
    chipColor: "#F9A8D4",
    logoLeft: "#EC4899",
    logoRight: "#F9A8D4",
  },
];

const DemoCard = ({
  balance,
  cardNumber = "5292 •••• •••• 3123",
  skin,
  style,
}) => {
  const activeSkin = skin || CARD_SKINS[0];

  const formattedBalance = Number(balance || 1000000).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  return (
    <LinearGradient
      colors={activeSkin.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {/* Decorative circles */}
      <View
        style={[
          styles.decorCircle1,
          { borderColor: activeSkin.accentColor + "20" },
        ]}
      />
      <View
        style={[
          styles.decorCircle2,
          { borderColor: activeSkin.accentColor + "12" },
        ]}
      />

      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.cardLabel, { color: activeSkin.subTextColor }]}>
            AVAILABLE BALANCE
          </Text>
          <Text style={[styles.cardAmount, { color: activeSkin.textColor }]}>
            ₹{formattedBalance}
          </Text>
        </View>
        {/* Chip */}
        <View
          style={[
            styles.chip,
            {
              backgroundColor: activeSkin.chipColor + "30",
              borderColor: activeSkin.chipColor + "60",
            },
          ]}
        >
          <View
            style={[
              styles.chipInner,
              { backgroundColor: activeSkin.chipColor + "50" },
            ]}
          />
        </View>
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <Text style={[styles.cardTitle, { color: activeSkin.textColor }]}>
          Stocksy
        </Text>
        {/* Logo circles */}
        <Image
          source={require("C:\\Users\\hP\\Documents\\Aniket\\PROJECTS\\Agency\\Stocksy\\STOCKSY\\Stocksy_Mobile\\assets\\StocksyLogo.png")}
          style={styles.companyLogo}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 180,
    borderRadius: 24,
    padding: moderateScale(22),
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  decorCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    bottom: -50,
    left: -30,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLabel: {
    fontSize: fontScale(9),
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: moderateScale(4),
  },
  cardAmount: {
    fontSize: fontScale(26),
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScale(4),
  },
  chipInner: {
    width: 22,
    height: 16,
    borderRadius: 3,
  },
  cardNumber: {
    fontSize: fontScale(Typography.caption),
    letterSpacing: 2,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: fontScale(Typography.bodyLarge),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logoCircles: {
    flexDirection: "row",
  },
  logoCircleLeft: {
    width: 22,
    height: 22,
    borderRadius: 11,
    opacity: 0.9,
  },
  logoCircleRight: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: moderateScale(-8),
    opacity: 0.9,
  },

  companyLogo: {
    width: 45,
    height: 45,
  },
});

export default DemoCard;
