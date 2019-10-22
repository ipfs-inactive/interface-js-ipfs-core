/* eslint-env mocha */
'use strict'

const concat = require('concat-stream')

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) => new Promise((resolve, reject) => {
    const stream = ipfs.refs.localReadableStream()
    stream.on('error', reject)
    stream.pipe(concat(resolve))
  })
  require('./refs-local-tests')(createCommon, '.refs.localReadableStream', ipfsRefsLocal, options)
}
