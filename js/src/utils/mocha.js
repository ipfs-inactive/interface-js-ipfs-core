/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')

chai.use(dirtyChai)

module.exports.expect = chai.expect

// Get a "describe" function that is optionally 'skipped' or 'onlyed'
// If skip/only are boolean true, then we want to skip/only the whole suite
function getDescribe (config) {
  if (config && config.skip === true) return describe.skip
  if (config && config.only === true) return describe.only
  return describe
}

module.exports.getDescribe = getDescribe

// Get an "it" function that is optionally 'skipped' or 'onlyed'
// If skip/only are an array, then we _might_ want to skip/only the specific test
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
