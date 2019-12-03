/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlist', function () {
    this.timeout(60 * 1000)
    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfsA = await common.setup()
      ipfsB = await common.setup({ type: 'go' })
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key).catch(() => {})
    })

    after(function () {
      this.timeout(30 * 1000)

      return common.teardown()
    })

    it('should get the wantlist', function () {
      return waitForWantlistKey(ipfsB, key)
    })

    it('should get the wantlist by peer ID for a different node', function () {
      return waitForWantlistKey(ipfsA, key, {
        peerId: ipfsB.peerId.id,
        timeout: 60 * 1000
      })
    })

    it('should not get the wantlist when offline', async () => {
      const node = await common.node()
      await node.stop()

      return expect(node.api.bitswap.stat()).to.eventually.be.rejected()
    })
  })
}
