/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsPingResponse, isPong } = require('./utils')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.ping', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should send the specified number of packets', async () => {
      const count = 3
      const responses = await ipfsA.ping(ipfsB.peerId.id, { count })
      responses.forEach(expectIsPingResponse)

      const pongs = responses.filter(isPong)
      expect(pongs.length).to.equal(count)
    })

    it('should fail when pinging a peer that is not available', async () => {
      const notAvailablePeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      try {
        await ipfsA.ping(notAvailablePeerId, { count })
        expect.fail('ping() did not throw when pinging a peer that is not available')
      } catch (err) {
        expect(err).to.exist()
      }
    })

    it('should fail when pinging an invalid peer Id', async () => {
      const invalidPeerId = 'not a peer ID'
      const count = 2

      try {
        await ipfsA.ping(invalidPeerId, { count })
        expect.fail('ping() did not throw when pinging an invalid peer Id')
      } catch (err) {
        expect(err).to.exist()
      }
    })
  })
}
