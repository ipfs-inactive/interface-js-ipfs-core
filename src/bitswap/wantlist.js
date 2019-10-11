/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
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

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key, () => {})
    })

    after(() => common.teardown())

    it('should get the wantlist', (done) => {
      waitForWantlistKey(ipfsB, key, done)
    })

    it('should get the wantlist by peer ID for a diffreent node', (done) => {
      waitForWantlistKey(ipfsA, key, { peerId: ipfsB.peerId.id }, done)
    })

    it('should not get the wantlist when offline', async () => {
      const node = await common.node()
      await node.stop()

      try {
        await node.bitswap.wantlist()
        throw new Error('should error')
      } catch (err) {
        expect(err).to.exist()
      }
    })
  })
}
