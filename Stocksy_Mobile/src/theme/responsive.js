import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const wp = (percent) =>
  (width * percent) / 100;

export const hp = (percent) =>
  (height * percent) / 100;

export const scale = (size) =>
  (width / guidelineBaseWidth) * size;

export const verticalScale = (size) =>
  (height / guidelineBaseHeight) * size;

export const moderateScale = (
  size,
  factor = 0.5
) =>
  size +
  (scale(size) - size) * factor;

export const fontScale = (size) =>
  PixelRatio.roundToNearestPixel(
    moderateScale(size)
  );