var path = require('path')
var nodeExternals = require('webpack-node-externals')
const NodemonPlugin = require('nodemon-webpack-plugin')

let wpc = {
  target: 'node',
  externals: [nodeExternals()],
  entry: ['babel-polyfill', './server/app.js'],
  devtool: '#eval',

  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },

  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [ 'stage-2' ]
        }
      }
    ],
    rules: [
      {
        test: /\.(js)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [path.resolve(__dirname, './server')]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [ 'es2015', 'stage-2' ]
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './server')
    }
  },
  plugins: [
    new NodemonPlugin({
      nodeArgs: ['--inspect=0.0.0.0:9225']
    })
  ]
}

module.exports = wpc
