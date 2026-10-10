import path from 'node:path';
import { fileURLToPath } from 'node:url';

import DiagnosticsPlugin from 'diagnostics-webpack-plugin';

import type { Configuration } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Configuration = {
  target: 'browserslist',
  experiments: {
    html: true,
    css: true,
    futureDefaults: true,
  },
  entry: {
    html: path.resolve(__dirname, 'src/index.html'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.mjs', '.js', '.json', '.mts'],
    tsconfig: true,
  },
  output: {
    filename: '[name].bundle.js',
    htmlFilename: '[name].html',
    cssFilename: '[name].bundle.css',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    module: true,
  },
  plugins: [
    new DiagnosticsPlugin({
      checks: [
        { use: 'eslint', extensions: ['js', 'mjs', 'ts', 'mts', 'tsx', 'jsx'] },
        { use: 'stylelint', extensions: ['css', 'scss'] },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ['sass-loader'],
        type: 'css',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.m?(t|j)s$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        parser: {
          typescript: false,
        },
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              allowImportingTsExtensions: false,
              noEmit: false,
            },
            onlyCompileBundledFiles: true,
          },
        },
      },
    ],
  },
};

export default config;
