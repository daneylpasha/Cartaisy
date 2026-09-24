const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

// These packages import native-only React Native modules. Expo web cannot
// bundle them. Native resolution is unchanged; only platform === "web" is shimmed.
const webModuleShims = {
  '@stripe/stripe-react-native': path.resolve(
    __dirname,
    'shims/stripe-react-native.web.tsx'
  ),
  '@react-native-firebase/app': path.resolve(
    __dirname,
    'shims/firebase-app.web.ts'
  ),
  '@react-native-firebase/messaging': path.resolve(
    __dirname,
    'shims/firebase-messaging.web.ts'
  ),
  'react-native-loader-kit': path.resolve(__dirname, 'shims/loader-kit.web.tsx'),
  'zustand/middleware': path.resolve(__dirname, 'shims/zustand-middleware.web.mjs'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && webModuleShims[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: webModuleShims[moduleName],
    };
  }

  // react-async-hook@3.6.1 points "module" at a file that is not published.
  // Web resolution prefers that field and fails. The CJS build in dist/ is real.
  if (platform === 'web' && moduleName === 'react-async-hook') {
    return context.resolveRequest(
      context,
      'react-async-hook/dist/index.js',
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
