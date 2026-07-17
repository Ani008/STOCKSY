import React from "react";
import { Text } from "react-native";

import {
  Colors,
  Typography,
} from "../theme";

const variants = {
  display: {
    fontSize: Typography.display,
    fontWeight: Typography.weight.extrabold,
  },

  h1: {
    fontSize: Typography.h1,
    fontWeight: Typography.weight.bold,
  },

  h2: {
    fontSize: Typography.h2,
    fontWeight: Typography.weight.bold,
  },

  h3: {
    fontSize: Typography.h3,
    fontWeight: Typography.weight.semibold,
  },

  h4: {
    fontSize: Typography.h4,
    fontWeight: Typography.weight.semibold,
  },

  bodyLarge: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.weight.medium,
  },

  body: {
    fontSize: Typography.body,
    fontWeight: Typography.weight.regular,
  },

  caption: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
  },

  small: {
    fontSize: Typography.small,
    fontWeight: Typography.weight.medium,
  },

  tiny: {
    fontSize: Typography.tiny,
    fontWeight: Typography.weight.medium,
  },
};

export default function AppText({
  children,
  variant = "body",
  color = Colors.text,
  align = "left",
  numberOfLines,
  style,
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        variants[variant],
        {
          color,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}