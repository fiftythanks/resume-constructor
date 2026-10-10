import { merge } from 'webpack-merge';

import common from './webpack.common.ts';

import type { Configuration } from 'webpack';

import 'webpack-dev-server';

const config = merge<Configuration>(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    server: 'https',
    static: './dist',
  },
});

export default config;
