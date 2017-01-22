var path = require('path');
var webpack = require('webpack');
var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = function (env) {

  return {
    context: path.resolve(process.cwd(), 'src'),

    entry: {
      'google-maps-loader': './GoogleMapsLoader',
      'google-maps-loader.min': './GoogleMapsLoader',
    },

    output: {
      filename: '[name].js',
      library: 'GoogleMapsLoader',
      libraryTarget: 'var',
      path: path.resolve(process.cwd(), 'dist'),
    },

    resolve: {
      modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
      extensions: ['.js', '.ts'],
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'awesome-typescript-loader',
        },
      ],
    },

    plugins: [
      new webpack.NoErrorsPlugin(),
      new webpack.LoaderOptionsPlugin({
        test: /\.min\.js$/,
        minimize: true
      }),
      new webpack.optimize.UglifyJsPlugin({
        include: /\.min\.js$/,
        output: {
          comments: false,
        },
        compressor: {
          warnings: false,
        },
      }),
      new TypedocWebpackPlugin({
        out: path.resolve(process.cwd(), 'docs'),
        tsconfig: 'tsconfig.json',
        exclude: '',
        excludePrivate: true,
        mode: 'file',
      }, ['./node_modules/@types', './project.d.ts', './src/GoogleMapsLoader.ts']),
    ],
  };
};