/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.get', function () {
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

          connect(nodeA, nodeB.peerId.addresses[0], done)
        })
      })
    })

    after(function (done) {
      this.timeout(50 * 1000)

      common.teardown(done)
    })

    it('should error when getting a non-existent key from the DHT', () => {
      return expect(nodeA.dht.get('non-existing', { timeout: 100 })).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should get a value after it was put on another node', async () => {
      const key = Buffer.from(hat())
      const value = Buffer.from(hat())

      await nodeB.dht.put(key, value)
      const result = await nodeA.dht.get(key)

      expect(result).to.eql(value)
    })
  })
}
