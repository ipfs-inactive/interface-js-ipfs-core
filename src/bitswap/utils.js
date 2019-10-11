'use strict'

const until = require('async/until')

function waitForWantlistKey (ipfs, key, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  opts.timeout = opts.timeout || 10000

  let list = { Keys: [] }

  const start = Date.now()
  const test = () => list.Keys.some(k => k['/'] === key)
  const iteratee = (cb) => {
    if (Date.now() - start > opts.timeout) {
      return cb(new Error(`Timed out waiting for ${key} in wantlist`))
    }
    ipfs.bitswap.wantlist(opts.peerId, (err, nextList) => {
      if (err) return cb(err)
      list = nextList
      cb()
    })
  }
  until(test, iteratee, (err) => {
    if (err) {
      return cb(err)
    }
    cb()
  })
}

module.exports.waitForWantlistKey = waitForWantlistKey
