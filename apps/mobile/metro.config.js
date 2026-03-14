const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to use a local cache directory
config.cacheStores = [
  new (require('metro-cache')).FileStore({
    root: path.join(__dirname, '.metro-cache'),
  }),
];

module.exports = config;
