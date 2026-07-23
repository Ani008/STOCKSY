import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * SegmentedToggle — reusable pill switch for 2 (or a few) mutually-exclusive
 * views, e.g. Holdings vs Positions on the Portfolio screen.
 *
 * Props:
 *   options       Array<{ key: string, label: string }>  (required)
 *   value         string — currently selected option's `key`
 *   onChange      (key: string) => void
 *   theme         "light" | "dark"  — controls track/thumb colours so the
 *                 same component works on both the blue Holdings background
 *                 and the dark Positions/intraday background.
 *   style         extra container style overrides
 */
export default function SegmentedToggle({
  options,
  value,
  onChange,
  theme = "light",
  style,
}) {
  const palette = theme === "dark" ? DARK : LIGHT;

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
  activeBg: "#FFFFFF",
  activeText: "#1A56DB",
  inactiveText: "rgba(255,255,255,0.85)",
};

const DARK = {
  track: "#1C1F26",
  activeBg: "#2E323C",
  activeText: "#FFFFFF",
  inactiveText: "#8A8F98",
};

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
    alignSelf: "flex-start",
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 17,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
});