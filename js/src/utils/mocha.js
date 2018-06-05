/* eslint-env mocha */

// Get a "describe" function that is optionally 'skipped' or 'onlyed'
function getDescribe (config) {
  if (config && config.skip === true) return describe.skip
  if (config && config.only === true) return describe.only
  return describe
}

module.exports.getDescribe = getDescribe

// Get an "it" function that is optionally 'skipped' or 'onlyed'
function getIt (config) {
  const _it = (name, impl) => {
    if (config && Array.isArray(config.skip)) {
      if (config.skip.includes(name)) return it.skip(name, impl)
    }

    if (config && Array.isArray(config.only)) {
      if (config.only.includes(name)) return it.only(name, impl)
    }

    it(name, impl)
  }

  _it.skip = it.skip
  _it.only = it.only

  return _it
}

module.exports.getIt = getIt
