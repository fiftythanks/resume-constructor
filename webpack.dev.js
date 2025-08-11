const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: './dist',
    watchFiles: ['./src/template.html'],
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
