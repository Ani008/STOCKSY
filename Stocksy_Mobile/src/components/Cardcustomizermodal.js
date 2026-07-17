import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DemoCard, { CARD_SKINS } from "./DemoCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_SPACING = 20;
const CARD_WIDTH = SCREEN_WIDTH - 80;

/**
 * CardCustomizerModal
 * Full-screen modal for selecting a card skin.
 * Scroll left/right to preview skins. Tick button to confirm.
 *
 * Props:
 * @param {boolean}  visible         - Controlled visibility
 * @param {function} onClose         - Called on dismiss
 * @param {string}   currentSkinId   - Active skin id
 * @param {number}   balance         - Demo balance for preview
 * @param {function} onSelectSkin    - Called with chosen skin object on confirm
 */
const CardCustomizerModal = ({
  visible,
  onClose,
  currentSkinId,
  balance,
  onSelectSkin,
}) => {
  const initialIndex = CARD_SKINS.findIndex((s) => s.id === currentSkinId) || 0;
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(Math.max(0, Math.min(index, CARD_SKINS.length - 1)));
  };

  const handleConfirm = () => {
    onSelectSkin(CARD_SKINS[activeIndex]);
    onClose();
  };

  const activeSkin = CARD_SKINS[activeIndex];

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0A0A0F", "#0D1117", "#111827"]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Card Style</Text>
          {/* Confirm tick */}
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
            <LinearGradient
              colors={[activeSkin.accentColor, activeSkin.accentColor + "CC"]}
              style={styles.confirmGradient}
            >
              <Ionicons name="checkmark" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Swipe to preview · Tap ✓ to apply
        </Text>

        {/* Card Scroll Preview */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onMomentumScrollEnd={handleScroll}
          style={styles.cardScroll}
        >
          {CARD_SKINS.map((skin, index) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                key={skin.id}
                activeOpacity={0.9}
                onPress={() => {
                  setActiveIndex(index);
                  scrollRef.current?.scrollTo({
                    x: index * (CARD_WIDTH + CARD_SPACING),
                    animated: true,
                  });
                }}
                style={[
                  styles.cardWrapper,
                  {
                    width: CARD_WIDTH,
                    marginRight: CARD_SPACING,
                    transform: [{ scale: isActive ? 1 : 0.9 }],
                    opacity: isActive ? 1 : 0.6,
                  },
                ]}
              >
                <DemoCard
                  balance={balance}
                  skin={skin}
                  style={{ width: "100%", height: 210 }}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {CARD_SKINS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && {
                  backgroundColor: activeSkin.accentColor,
                  width: 20,
                },
              ]}
            />
          ))}
        </View>

        {/* Skin name */}
        <Text style={[styles.skinName, { color: activeSkin.accentColor }]}>
          {activeSkin.label}
        </Text>

        {/* Skin swatches grid */}
        <View style={styles.swatchRow}>
          {CARD_SKINS.map((skin, index) => (
            <TouchableOpacity
              key={skin.id}
              onPress={() => {
                setActiveIndex(index);
                scrollRef.current?.scrollTo({
                  x: index * (CARD_WIDTH + CARD_SPACING),
                  animated: true,
                });
              }}
              style={styles.swatchWrapper}
            >
              <LinearGradient
                colors={skin.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.swatch,
                  index === activeIndex && {
                    borderColor: skin.accentColor,
                    borderWidth: 2.5,
                    transform: [{ scale: 1.15 }],
                  },
                ]}
              />
              {index === activeIndex && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={skin.accentColor}
                  style={styles.swatchCheck}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Apply button */}
        <TouchableOpacity onPress={handleConfirm} style={styles.applyBtn}>
          <LinearGradient
            colors={[activeSkin.accentColor, activeSkin.accentColor + "AA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyGradient}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.applyText}>Apply "{activeSkin.label}"</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  confirmBtn: {
    borderRadius: 19,
    overflow: "hidden",
  },
  confirmGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  cardScroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: "visible",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  skinName: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 24,
  },
  swatchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  swatchWrapper: {
    alignItems: "center",
    position: "relative",
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchCheck: {
    position: "absolute",
    bottom: -5,
    right: -2,
    backgroundColor: "#0A0A0F",
    borderRadius: 7,
  },
  applyBtn: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  applyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  applyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default CardCustomizerModal;