const webpack = require('webpack');

module.exports = {
  //mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  mode: 'development',
  entry: './map.js',
  output: {
    path: __dirname,
    filename: './map-bundle.js'
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          }
        ],
      },
    ],
  },
};