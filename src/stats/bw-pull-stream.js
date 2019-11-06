/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')
const pullToPromise = require('pull-to-promise')

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

    it('should get bandwidth stats over pull stream', async () => {
      const stream = ipfs.stats.bwPullStream()

      const data = await pullToPromise.any(stream)
      expectIsBandwidth(null, data[0])
    })
  })
}
