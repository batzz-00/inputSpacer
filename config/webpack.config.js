const path = require('path')
module.exports = {
  devtool: 'source-map',
  entry: './src/index',
  output: {
    library: 'inputSpacer',
    libraryExport: 'default',
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist/prod')
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
