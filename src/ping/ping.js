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

    it('should send the specified number of packets', (done) => {
      const count = 3
      ipfsA.ping(ipfsB.peerId.id, { count }, (err, responses) => {
        expect(err).to.not.exist()
        responses.forEach(expectIsPingResponse)
        const pongs = responses.filter(isPong)
        expect(pongs.length).to.equal(count)
        done()
      })
    })

    it('should fail when pinging a peer that is not available', (done) => {
      const notAvailablePeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      ipfsA.ping(notAvailablePeerId, { count }, (err, responses) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should fail when pinging an invalid peer Id', (done) => {
      const invalidPeerId = 'not a peer ID'
      const count = 2
      ipfsA.ping(invalidPeerId, { count }, (err, responses) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
