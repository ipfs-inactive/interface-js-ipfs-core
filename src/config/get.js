/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const isPlainObject = require('is-plain-object')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.get', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should retrieve the whole config', async () => {
      const config = await ipfs.config.get()

      expect(config).to.be.an('object')
      expect(isPlainObject(config)).to.equal(true)
    })

    it('should retrieve a value through a key', async () => {
      const peerId = await ipfs.config.get('Identity.PeerID')
      expect(peerId).to.exist()
    })

    it('should retrieve a value through a nested key', async () => {
      const swarmAddrs = await ipfs.config.get('Addresses.Swarm')
      expect(swarmAddrs).to.exist()
    })

    it('should fail on non valid key', async () => {
      try {
        await ipfs.config.get(1234)
        expect.fail('config.get() did not throw on non valid key')
      } catch (err) {
        expect(err).to.exist()
      }
    })

    it('should fail on non existent key', async () => {
      try {
        await ipfs.config.get('Bananas')
        expect.fail('config.get() did not throw on non existent key')
      } catch (err) {
        expect(err).to.exist()
      }
    })
  })
}
