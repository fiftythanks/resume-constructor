const { merge } = require('webpack-merge');

const common = require('./webpack.common.cjs');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    server: 'https',
    static: './dist',
    watchFiles: ['./src/index.html'],
  },
});
