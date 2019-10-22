/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const pull = require('pull-stream')
const { getDescribe, getIt } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bwPullStream', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get bandwidth stats over pull stream', () => {
      const stream = ipfs.stats.bwPullStream()

      return new Promise((resolve) => {
        pull(
          stream,
          pull.collect((err, data) => {
            expectIsBandwidth(err, data[0])
            resolve()
          })
        )
      })
    })
  })
}
