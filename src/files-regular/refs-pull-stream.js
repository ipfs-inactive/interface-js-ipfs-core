/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')

module.exports = (createCommon, options) => {
  const ipfsRefs = (ipfs) => (path, params) => new Promise((resolve) => {
    const stream = ipfs.refsPullStream(path, params)
    pull(stream, pull.collect((_, res) => resolve(res)))
  })
  require('./refs-tests')(createCommon, '.refsPullStream', ipfsRefs, options)
}
