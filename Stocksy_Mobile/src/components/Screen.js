import React from "react";
import {
  ScrollView,
  View,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Layout } from "../theme";

export default function Screen({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  edges,
  statusBarStyle = "dark-content",
}) {
  if (scroll) {
    return (
      <SafeAreaView style={[Layout.screen, style]} edges={edges}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor="transparent"
          translucent
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            Layout.content,
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[Layout.screen, style]} edges={edges}>
      <View
        style={[
          Layout.content,
          { flex: 1 },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}