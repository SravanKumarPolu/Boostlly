// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Enable hierarchical lookup for React Native internal modules
// This allows Metro to find @react-native/* modules correctly
config.resolver.disableHierarchicalLookup = false;

// 4. Add extra node modules paths for better resolution
config.resolver.extraNodeModules = {
  '@react-native': path.resolve(workspaceRoot, 'node_modules', 'react-native'),
};

module.exports = config;

