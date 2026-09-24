/**
 * Expo web stand-in for @react-native-firebase/app.
 * Native Firebase is not initialized in the browser, so push setup no-ops.
 */
const firebase = {
  apps: [] as unknown[],
};

export default firebase;
