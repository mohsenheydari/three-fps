const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const buildPath = './build/';

module.exports = {
  entry: ['./src/entry.js'],
  output: {
    path: path.join(__dirname, buildPath),
    filename: '[name].[fullhash].js',
    publicPath: '',
  },
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: path.resolve(__dirname, './node_modules/')
      },
      {
        test: /\.(jpe?g|png|gif|svg|tga|glb|gltf|bin|fbx|babylon|mtl|pcb|pcd|prwm|obj|mat|mp3|ogg|wav)$/i,
        use: {
          loader: 'file-loader',
          options: {
              esModule: false
          }
        },
        exclude: path.resolve(__dirname, './node_modules/')
      },
    ]
  },
  resolve: {
    alias: {
      vendor: path.resolve(__dirname, 'vendor')
    },
    fallback: {
      'fs': false,
      'path': false, // ammo.js seems to also use path
    }
  },
  plugins: [
    new HtmlWebpackPlugin({'title': 'Three.js FPS Demo | Venolabs', template: './src/index.html'})
  ]
}
