const TerserPlugin = require('terser-webpack-plugin');
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          /**
           * These are needed for `pdf.js`, according to
           * https://github.com/mozilla/pdf.js/tree/master/examples/webpack
           */
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
});
