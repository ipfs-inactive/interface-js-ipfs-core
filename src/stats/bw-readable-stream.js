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

  describe('.stats.bwReadableStream', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get bandwidth stats over readable stream', (done) => {
      const stream = ipfs.stats.bwReadableStream()

      stream.once('data', (data) => {
        expectIsBandwidth(null, data)
        stream.destroy()
        done()
      })
    })
  })
}
