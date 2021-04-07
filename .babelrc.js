var defaults = require('@pcattori/react-toolkit').babel()
module.exports = {
  ...defaults,
  // overrides go here
  presets: [...defaults.presets, '@emotion/babel-preset-css-prop'],
}