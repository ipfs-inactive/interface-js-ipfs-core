/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.bitswap.wantlist', () => {
    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      const factory = await common.setup()
      const nodes = await spawnNodesWithId(2, factory)

      ipfsA = nodes[0]
      ipfsB = nodes[1]

      // Add key to the wantlist for ipfsB
      ipfsB.block.get(key)

      return connect(ipfsA, ipfsB.peerId.addresses[0])
    })

    after(async function () {
      this.timeout(30 * 1000)
      return common.teardown()
    })

    it('should get the wantlist', () => waitForWantlistKey(ipfsB, key))

    it('should get the wantlist by peer ID for a diffreent node', async () => {
      const info = await ipfsB.id()
      return waitForWantlistKey(ipfsA, key, { peerId: info.id })
    })

    it('should not get the wantlist when offline', async function () {
      this.timeout(60 * 1000)

      const common = createCommon()
      const factory = await common.setup()
      const ipfs = factory.spawnNode()
      await ipfs.stop()

      // TODO: assert on error message/code
      await expect(ipfs.bitswap.wantlist()).to.be.rejected()
      return common.teardown()
    })
  })
}
