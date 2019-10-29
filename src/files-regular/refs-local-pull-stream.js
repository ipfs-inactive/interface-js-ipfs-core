/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')

module.exports = (createCommon, options) => {
  const ipfsRefsLocal = (ipfs) =>
    new Promise((resolve, reject) => {
      const stream = ipfs.refs.localPullStream()
      pull(stream, pull.collect((err, res) => err ? reject(err) : resolve(res)))
    })
  require('./refs-local-tests')(createCommon, '.refs.localPullStream', ipfsRefsLocal, options)
}
