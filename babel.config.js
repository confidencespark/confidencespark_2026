module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@assets': './src/assets',
            '@features': './src/features',
            '@navigation': './src/navigation',
            '@components': './src/components',
            '@unistyles': './src/unistyles',
            // '@services': './src/services',
            // '@states': './src/states',
            '@utils': './src/utils',
            '@lib': './src/lib',
            '@constants': './src/constants',
            '@store': './src/store',
          },
        },
      ],
      '@babel/plugin-transform-export-namespace-from',
      'react-native-worklets/plugin', // includes Reanimated - must be last
    ],
  };
};
// ConfidenceSpark workspace batch
