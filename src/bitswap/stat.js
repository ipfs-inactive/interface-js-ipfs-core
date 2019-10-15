/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsBitswap } = require('../stats/utils')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.stat', function () {
    this.timeout(60 * 1000)
    let ipfs
    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get bitswap stats', async () => {
      const res = await ipfs.bitswap.stat()
      expectIsBitswap(null, res)
    })

    it('should not get bitswap stats when offline', async () => {
      const node = await common.node()
      await node.stop()

      try {
        await node.api.bitswap.stat()
        expect.fail('bitswap.stat() did not throw an error as expected')
      } catch (err) {
        expect(err).to.exist()
      }
    })
  })
}
