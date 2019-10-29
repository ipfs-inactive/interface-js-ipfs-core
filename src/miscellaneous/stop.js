/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stop', () => {
    // must be last test to run
    it('should stop the node', async function () {
      this.timeout(10 * 1000)
      const ipfs = await common.node()

      await ipfs.stop()

      await expect(ipfs.stop()).to.be.rejected()
    })
  })
}
