import { merge } from 'webpack-merge';

import common from './webpack.common.ts';

import type { Configuration } from 'webpack';

const config = merge<Configuration>(common, {
  mode: 'production',
  devtool: 'source-map',
});

export default config;
