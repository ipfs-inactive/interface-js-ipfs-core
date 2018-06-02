/* eslint-env mocha */

// Get a describe function that is optionally 'skipped' or 'onlyed'
function getDescribe (config) {
  if (config && config.skip) return describe.skip
  if (config && config.only) return describe.only
  return describe
}

module.exports.getDescribe = getDescribe
