/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bw', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get bandwidth stats', function (done) {
      ipfs.stats.bw((err, res) => {
        expectIsBandwidth(err, res)
        done()
      })
    })

    it('should get bandwidth stats (promised)', () => {
      return ipfs.stats.bw().then((res) => {
        expectIsBandwidth(null, res)
      })
    })
  })
}
