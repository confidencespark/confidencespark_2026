module.exports = {
  project: {
    ios: {},
    android: {},
  },
  'react-native-vector-icons': {
    platforms: {
      ios: null,
    },
  },
  assets: [
    './src/assets/fonts/',
    './node_modules/react-native-vector-icons/Fonts',
  ],
  getTransformModulePath() {
    return require.resolve('react-native-typescript-transformer');
  },
  getSourceExts() {
    return ['ts', 'tsx', 'js', 'jsx'];
  },
};
