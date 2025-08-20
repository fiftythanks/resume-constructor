const path = require('path');

const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/index.tsx'),
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.mjs',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.mjs', '.js', '.json'],
    alias: {
      '@/*': path.resolve(__dirname, 'src/*'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Production',
      template: './src/index.html',
    }),
    new ESLintPlugin({ configType: 'flat' }),
    new StylelintPlugin({}),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',

          // Translates CSS into CommonJS
          {
            loader: 'css-loader',
            options: {
              // The number of loaders applied before CSS loader
              importLoaders: 2,
            },
          },

          // Processes CSS with PostCSS
          'postcss-loader',

          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // TODO: get rid of `babel-loader` as soon as you fully migrate to TypeScript.
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: 'defaults',
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.m?tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false,
              allowImportingTsExtensions: false,
            },
          },
        },
      },
    ],
  },
};
