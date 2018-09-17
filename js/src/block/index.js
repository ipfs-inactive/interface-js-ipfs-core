'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  put: require('./put'),
  get: require('./get'),
  rm: require('./rm'),
  stat: require('./stat')
}

module.exports = createSuite(tests)
