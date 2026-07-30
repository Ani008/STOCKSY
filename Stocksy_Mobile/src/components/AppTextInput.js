import React, { forwardRef } from "react";
import { TextInput } from "react-native";

// Thin passthrough wrapper — same fix as AppText.js, applied to TextInput.
// `TextInput.defaultProps` mutation does not work in this RN/React version
// (see the note in App.js), so this sets `allowFontScaling={false}` per
// instance instead. Import TextInput from here instead of directly from
// 'react-native' anywhere user-entered or displayed numeric text (OTP
// digits, amounts, prices) must not reflow with the OS text-size setting.
//
// Wrapped in forwardRef so existing `ref={...}` usage (e.g. focus-jumping
// between OTP boxes, focusing an amount field) keeps working exactly as
// before — a plain function component would silently break those refs.
const AppTextInput = forwardRef(function AppTextInput({ style, ...rest }, ref) {
  return <TextInput ref={ref} allowFontScaling={false} style={style} {...rest} />;
});

export default AppTextInput;
