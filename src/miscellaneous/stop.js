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

  describe('.stop', function () {
    this.timeout(60 * 1000)

    it('should stop the node', async () => {
      const ipfs = await common.node()

      await ipfs.stop()
      // Trying to stop an already stopped node should return an error
      // as the node can't respond to requests anymore
      return expect(ipfs.api.stop()).to.eventually.be.rejected()
    })
  })
}
