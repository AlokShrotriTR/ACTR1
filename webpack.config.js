const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const publicPath = isProduction ? './' : '/';

  return {
    entry: './src/index.tsx',
    mode: isProduction ? 'production' : 'development',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'bundle.js',
      publicPath: publicPath,
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        templateParameters: {
          PUBLIC_URL: isProduction ? '.' : '',
        },
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.REACT_APP_SERVICENOW_INSTANCE': JSON.stringify(process.env.REACT_APP_SERVICENOW_INSTANCE || 'https://dev279775.service-now.com'),
        'process.env.REACT_APP_SERVICENOW_CLIENT_ID': JSON.stringify(process.env.REACT_APP_SERVICENOW_CLIENT_ID || ''),
        'process.env.REACT_APP_SERVICENOW_CLIENT_SECRET': JSON.stringify(process.env.REACT_APP_SERVICENOW_CLIENT_SECRET || ''),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'build'),
      },
      compress: true,
      port: 3000,
      server: 'https',
      allowedHosts: 'all',
      historyApiFallback: true,
    },
  };
};
