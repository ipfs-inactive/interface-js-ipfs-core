/* eslint-env mocha */
'use strict'

const hat = require('hat')
const waterfall = require('async/waterfall')
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

    it('should error when getting a non-existent key from the DHT', (done) => {
      nodeA.dht.get('non-existing', { timeout: 100 }, (err, value) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('should get a value after it was put on another node', function (done) {
      this.timeout(80 * 1000)

      const key = Buffer.from(hat())
      const value = Buffer.from(hat())

      waterfall([
        cb => nodeB.dht.put(key, value, cb),
        cb => nodeA.dht.get(key, cb),
        (result, cb) => {
          expect(result).to.eql(value)
          cb()
        }
      ], done)
    })
  })
}
