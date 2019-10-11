/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')
const { expectIsBitswap } = require('./utils')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bitswap', () => {
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get bitswap stats', async () => {
      const res = await ipfs.stats.bitswap()
      expectIsBitswap(null, res)
    })
  })
}
