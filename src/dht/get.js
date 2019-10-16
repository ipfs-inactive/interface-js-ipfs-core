/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.get', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = await common.setup()
      nodeB = await common.setup()
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should error when getting a non-existent key from the DHT', async () => {
      try {
        await nodeA.dht.get('non-existing', { timeout: 100 })
        expect.fail('dht.get() did not throw when getting a non-existent key from the DHT')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
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
