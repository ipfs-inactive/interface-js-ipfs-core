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

  describe('.dht.query', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = await common.setup()
      nodeB = await common.setup()
      await nodeB.swarm.connect(nodeA.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should return the other node in the query', function (done) {
      const timeout = 150 * 1000
      this.timeout(timeout)

      let skipped = false

      // This test is meh. DHT works best with >= 20 nodes. Therefore a
      // failure might happen, but we don't want to report it as such.
      // Hence skip the test before the timeout is reached
      const timeoutId = setTimeout(function () {
        skipped = true
        this.skip()
      }.bind(this), timeout - 1000)

      nodeA.dht.query(nodeB.peerId.id, (err, peers) => {
        if (skipped) return
        clearTimeout(timeoutId)
        expect(err).to.not.exist()
        expect(peers.map((p) => p.id.toB58String())).to.include(nodeB.peerId.id)
        done()
      })
    })
  })
}
