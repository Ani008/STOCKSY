import React from "react";
import { View } from "react-native";

import { Colors, Radius, Shadows, moderateScale } from "../theme";

export default function Card({
  children,
  style,
}) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.card,
          borderRadius: Radius.xl,
          padding: moderateScale(16),
          ...Shadows.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}