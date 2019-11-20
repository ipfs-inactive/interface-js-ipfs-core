/* eslint-env mocha */
'use strict'

const multihashing = require('multihashing-async')
const parallel = require('async/parallel')
const CID = require('cids')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

async function fakeCid () {
  const bytes = Buffer.from(`TEST${Date.now()}`)

  const mh = await multihashing(bytes, 'sha2-256')

  return new CID(0, 'dag-pb', mh)
}

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.findProvs', function () {
    let nodeA
    let nodeB
    let nodeC

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(3, factory, (err, nodes) => {
          expect(err).to.not.exist()

          nodeA = nodes[0]
          nodeB = nodes[1]
          nodeC = nodes[2]

          parallel([
            (cb) => connect(nodeB, nodeA.peerId.addresses[0], cb),
            (cb) => connect(nodeC, nodeB.peerId.addresses[0], cb)
          ], done)
        })
      })
    })

    let providedCid
    before('add providers for the same cid', async function () {
      const cids = await Promise.all([
        nodeB.object.new('unixfs-dir'),
        nodeC.object.new('unixfs-dir')
      ])

      providedCid = cids[0]

      await Promise.all([
        nodeB.dht.provide(providedCid),
        nodeC.dht.provide(providedCid)
      ])
    })

    it('should be able to find providers', async function () {
      const provs = await nodeA.dht.findProvs(providedCid)
      const providerIds = provs.map((p) => p.id.toB58String())

      expect(providerIds).to.have.members([
        nodeB.peerId.id,
        nodeC.peerId.id
      ])
    })

    it('should take options to override timeout config', async function () {
      const options = {
        timeout: 1
      }

      const cidV0 = await fakeCid()

      await expect(nodeA.dht.findProvs(cidV0, options)).to.be.rejected()
    })
  })
}
