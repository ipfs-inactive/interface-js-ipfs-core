'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  put: require('./put'),
  findPeer: require('./findPeer'),
  provide: require('./provide'),
  findProvs: require('./findProvs'),
  query: require('./query')
}

module.exports = createSuite(tests)
