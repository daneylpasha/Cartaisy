/**
 * Expo web stand-in for @react-native-firebase/messaging.
 * The native module is not available in the browser.
 */
const messaging = () => ({
  setBackgroundMessageHandler: async () => undefined,
  getInitialNotification: async () => null,
  requestPermission: async () => 0,
  getToken: async () => "",
  onMessage: () => () => undefined,
  onTokenRefresh: () => () => undefined,
});

export default messaging;
