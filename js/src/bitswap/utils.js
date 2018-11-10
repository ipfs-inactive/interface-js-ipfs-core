'use strict'

async function waitForWantlistKey (ipfs, key, opts) {
  opts = opts || {}
  opts.timeout = opts.timeout || 1000

  const start = Date.now()

  while (Date.now() <= start + opts.timeout) {
    const list = await ipfs.bitswap.wantlist(opts.peerId)
    if (list.Keys.find(k => k['/'] === key)) return
  }

  throw new Error(`Timed out waiting for ${key} in wantlist`)
}

module.exports.waitForWantlistKey = waitForWantlistKey
