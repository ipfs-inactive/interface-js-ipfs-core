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

      try {
        // Trying to stop an already stopped node should return an error
        // as the node can't respond to requests anymore
        await ipfs.stop()
        expect.fail()
      } catch (err) {
        expect(err).to.exist()
      }
    })
  })
}
