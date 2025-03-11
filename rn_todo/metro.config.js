const { getDefaultConfig } = require("@expo/metro-config");

const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push("cjs");

// Wrap with Reanimated Metro config
const reanimatedConfig = wrapWithReanimatedMetroConfig(defaultConfig);

module.exports = reanimatedConfig;
