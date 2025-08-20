const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.cjs');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
  plugins: [new CleanWebpackPlugin()],
});
