/* eslint-env mocha */
'use strict'

const test = require('./src/index.js') // Replace with interface-ipfs-core in your repo
const IPFS = require('ipfs')

const common = {
  setup: function (cb) {
    const ipfs = new IPFS() // Replace with your instance
    ipfs.load(() => {
      cb(null, ipfs)
    })
  },
  teardown: function (cb) {
    cb()
  }
}

test.files(common)