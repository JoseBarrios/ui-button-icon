const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

const config = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'element'),
    filename: 'ui-share-button-data-controller.js'
  },
};

module.exports = config;
