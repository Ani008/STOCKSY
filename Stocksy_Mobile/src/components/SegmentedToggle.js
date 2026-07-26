import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Colors, Typography, fontScale, moderateScale } from "../theme";

/**
 * SegmentedToggle — reusable pill switch for 2 (or a few) mutually-exclusive
 * views, e.g. Holdings vs Positions on the Portfolio screen.
 *
 * Props:
 *   options       Array<{ key: string, label: string }>  (required)
 *   value         string — currently selected option's `key`
 *   onChange      (key: string) => void
 *   theme         "light" | "dark" | "neutral" — controls track/thumb
 *                 colours: "light" for colored (blue) backgrounds, "dark"
 *                 for near-black surfaces, "neutral" for plain white cards.
 *   style         extra container style overrides
 */
export default function SegmentedToggle({
  options,
  value,
  onChange,
  theme = "light",
  style,
}) {
  const palette = theme === "dark" ? DARK : theme === "neutral" ? NEUTRAL : LIGHT;

  return (
    <View style={[styles.track, { backgroundColor: palette.track }, style]}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.pill,
              active && { backgroundColor: palette.activeBg },
            ]}
            activeOpacity={0.8}
            onPress={() => onChange(opt.key)}
          >
            <Text
              style={[
                styles.label,
                { color: active ? palette.activeText : palette.inactiveText },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const LIGHT = {
  track: "rgba(255,255,255,0.18)",
  activeBg: Colors.white,
  activeText: Colors.primaryDark,
  inactiveText: "rgba(255,255,255,0.85)",
};

const DARK = {
  track: "#1C1F26",
  activeBg: "#2E323C",
  activeText: Colors.white,
  inactiveText: "#8A8F98",
};

// For plain white/card surfaces (e.g. DashboardPage's Total Assets card) —
// LIGHT and DARK above assume a colored (blue/black) backdrop and would be
// invisible or too heavy sitting directly on white.
const NEUTRAL = {
  track: Colors.divider,
  activeBg: Colors.white,
  activeText: Colors.primaryDark,
  inactiveText: Colors.textSecondary,
};

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 20,
    padding: moderateScale(3),
    alignSelf: "flex-start",
  },
  pill: {
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(7),
    borderRadius: 17,
  },
  label: {
    fontSize: fontScale(Typography.caption),
    fontWeight: "700",
  },
});