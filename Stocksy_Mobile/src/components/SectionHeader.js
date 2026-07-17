import React from "react";
import {
  View,
  Text,
} from "react-native";

import {
  Typography,
  Colors,
  Spacing,
} from "../theme";

export default function SectionHeader({
  title,
  right,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.lg,
      }}
    >
      <Text
        style={{
          fontSize: Typography.h3,
          fontWeight: Typography.weight.bold,
          color: Colors.text,
        }}
      >
        {title}
      </Text>

      {right}
    </View>
  );
}