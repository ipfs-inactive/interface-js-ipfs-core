/* eslint-env mocha */
'use strict'

const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

const checkAll = (bits) => string => bits.every(bit => string.includes(bit))

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.findPeer', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()

          nodeA = nodes[0]
          nodeB = nodes[1]

          connect(nodeB, nodeA.peerId.addresses[0], done)
        })
      })
    })

    after(function (done) {
      this.timeout(50 * 1000)

      common.teardown(done)
    })

    it('should find other peers', (done) => {
      nodeA.dht.findPeer(nodeB.peerId.id, (err, res) => {
        expect(err).to.not.exist()

        const id = res[0].id.toB58String()
        const addrs = res[0].multiaddrs.toArray().map((ma) => ma.toString())

        expect(id).to.be.eql(nodeB.peerId.id)
        expect(nodeB.peerId.addresses[0]).to.satisfy(checkAll([addrs[0]]))
        done()
      })
    })

    it('should fail to find other peer if peer does not exist', (done) => {
      nodeA.dht.findPeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ', (err, peer) => {
        expect(err).to.exist()
        expect(peer).to.not.exist()
        done()
      })
    })
  })
}
