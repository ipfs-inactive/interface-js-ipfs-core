/* eslint-env mocha */
'use strict'

const waterfall = require('async/waterfall')
const { waitUntilConnected } = require('../utils/connections')
const { spawnNodes } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { waitForWantlistKey } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.bitswap.wantlist', () => {
    let ipfsA
    let ipfsB
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodes(2, factory, (err, nodes) => {
          expect(err).to.not.exist()

          ipfsA = nodes[0]
          ipfsB = nodes[1]

          // Add key to the wantlist for ipfsB
          ipfsB.block.get(key, () => {})

          waitUntilConnected(ipfsA, ipfsB, done)
        })
      })
    })

    after(function (done) {
      this.timeout(30 * 1000)
      common.teardown(done)
    })

    it('should get the wantlist', (done) => {
      waitForWantlistKey(ipfsB, key, done)
    })

    it('should get the wantlist by peer ID for a diffreent node', (done) => {
      ipfsB.id((err, info) => {
        expect(err).to.not.exist()
        waitForWantlistKey(ipfsA, key, { peerId: info.id }, done)
      })
    })

    it('should not get the wantlist when offline', function (done) {
      this.timeout(60 * 1000)

      waterfall([
        (cb) => createCommon().setup(cb),
        (factory, cb) => factory.spawnNode(cb),
        (node, cb) => node.stop((err) => cb(err, node))
      ], (err, node) => {
        expect(err).to.not.exist()
        node.bitswap.wantlist((err) => {
          expect(err).to.exist()
          done()
        })
      })
    })
  })
}
