'use strict'

const delay = require('delay')

async function waitForWantlistKey (ipfs, key, opts = {}) {
  opts.timeout = opts.timeout || 10000
  const start = Date.now()
  const end = start + opts.timeout

  while (Date.now() < end) {
    const list = await ipfs.bitswap.wantlist(opts.peerId)

    if (list.Keys.some(k => k['/'] === key)) {
      return
    }

    delay(500)
  }

  throw new Error(`Timed out waiting for ${key} in wantlist`)
}

module.exports.waitForWantlistKey = waitForWantlistKey
