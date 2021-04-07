/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

const CopyPlugin = require('copy-webpack-plugin')
const defaults = require('@pcattori/react-toolkit').webpack()

module.exports = {
  ...defaults,
  // overrides go here
  plugins: [
    ...(defaults.plugins || []),
    new CopyPlugin({
      patterns: [{ from: 'public' }],
    }),
  ],
  module: {
    ...defaults.module,
    rules: [
      ...defaults.module.rules,
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    ...defaults.devServer,
    contentBase: path.join(__dirname, 'public'),
  },
}
