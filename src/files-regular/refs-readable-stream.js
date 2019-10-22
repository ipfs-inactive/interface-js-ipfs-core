/* eslint-env mocha */
'use strict'

const concat = require('concat-stream')

module.exports = (createCommon, options) => {
  const ipfsRefs = (ipfs) => (path, params, cb) => new Promise((resolve, reject) => {
    const stream = ipfs.refsReadableStream(path, params)
    stream.on('error', reject)
    stream.pipe(concat(resolve))
  })
  require('./refs-tests')(createCommon, '.refsReadableStream', ipfsRefs, options)
}
