/* eslint-env mocha */
'use strict'

const series = require('async/series')
const { spawnNodesWithId } = require('../utils/spawn')
const { waitUntilConnected } = require('../utils/connections')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsPingResponse, isPong } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.ping', function () {
    this.timeout(15 * 1000)

    let ipfsdA
    let ipfsdB

    before(function (done) {
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        if (err) return done(err)

        series([
          (cb) => {
            spawnNodesWithId(2, factory, (err, nodes) => {
              if (err) return cb(err)
              ipfsdA = nodes[0]
              ipfsdB = nodes[1]
              cb()
            })
          },
          (cb) => waitUntilConnected(ipfsdA, ipfsdB, cb)
        ], done)
      })
    })

    after((done) => common.teardown(done))

    it('should send the specified number of packets', (done) => {
      const count = 3
      ipfsdA.ping(ipfsdB.peerId.id, { count }, (err, responses) => {
        expect(err).to.not.exist()
        responses.forEach(expectIsPingResponse)
        const pongs = responses.filter(isPong)
        expect(pongs.length).to.equal(count)
        done()
      })
    })

    it('should fail when pinging an unknown peer', (done) => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      ipfsdA.ping(unknownPeerId, { count }, (err, responses) => {
        expect(err).to.exist()
        expect(responses[0].text).to.include('Looking up')
        expect(responses[1].success).to.be.false()
        done()
      })
    })

    it('should fail when pinging an invalid peer', (done) => {
      const invalidPeerId = 'not a peer ID'
      const count = 2
      ipfsdA.ping(invalidPeerId, { count }, (err, responses) => {
        expect(err).to.exist()
        expect(err.message).to.include('failed to parse peer address')
        done()
      })
    })
  })
}
