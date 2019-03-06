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
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        use: ['file-loader']
      },
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpg|png|gif|svg|pdf|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images'
            }
          }
        ]
      }
    ]
  },
  target: 'web'
}
