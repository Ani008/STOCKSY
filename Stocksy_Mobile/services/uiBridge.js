/**
 * services/uiBridge.js
 *
 * api.js's axios interceptor is a plain module, not a React component —
 * it can't use hooks or context directly. This bridge lets it trigger
 * UI reactions (toast, session-expired screen) that live inside the
 * React tree, without a circular import back into any page/component.
 *
 * Pattern: whatever owns the actual state (ToastProvider, App.js)
 * registers a handler here on mount. Anything else just calls the
 * exported trigger function — if nothing's registered yet (e.g. a
 * request fails during initial app boot before mount), it's a no-op
 * rather than a crash.
 */

let toastHandler = null;
let sessionExpiredHandler = null;

export function registerToastHandler(fn) {
  toastHandler = fn;
}

export function showToast(message, severity = 'error') {
  if (toastHandler) toastHandler(message, severity);
}

export function registerSessionExpiredHandler(fn) {
  sessionExpiredHandler = fn;
}

export function triggerSessionExpired() {
  if (sessionExpiredHandler) sessionExpiredHandler();
}