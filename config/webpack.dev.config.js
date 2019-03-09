const path = require('path')
module.exports = {
  devtool: 'eval-source-map',
  entry: './src/index',
  output: {
    library: 'inputSpacer',
    libraryExport: 'default',
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist/dev')
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  target: 'web'
}
