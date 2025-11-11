module.exports = {
  root: true,
  extends: ['expo'],
  rules: {
    '@typescript-eslint/ban-types': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', '*.config.js'],
};

