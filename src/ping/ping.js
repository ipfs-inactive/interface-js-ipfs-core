/* eslint-env mocha */
'use strict'

const series = require('async/series')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsPingResponse, isPong } = require('./utils')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.ping', function () {
    // TODO revisit when https://github.com/ipfs/go-ipfs/issues/5799 is resolved
    this.timeout(2 * 60 * 1000)

    let ipfsA
    let ipfsB

    before(function (done) {
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        if (err) return done(err)

        series([
          (cb) => {
            spawnNodesWithId(2, factory, (err, nodes) => {
              if (err) return cb(err)
              ipfsA = nodes[0]
              ipfsB = nodes[1]
              cb()
            })
          },
          (cb) => connect(ipfsA, ipfsB.peerId.addresses[0], cb)
        ], done)
      })
    })

    after((done) => common.teardown(done))

    it('should send the specified number of packets', async () => {
      const count = 3
      const responses = await ipfsA.ping(ipfsB.peerId.id, { count })
      responses.forEach(expectIsPingResponse)

      const pongs = responses.filter(isPong)
      expect(pongs.length).to.equal(count)
    })

    it('should fail when pinging a peer that is not available', () => {
      const notAvailablePeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      return expect(ipfsA.ping(notAvailablePeerId, { count })).to.eventually.be.rejected()
    })

    it('should fail when pinging an invalid peer Id', () => {
      const invalidPeerId = 'not a peer ID'
      const count = 2

      return expect(ipfsA.ping(invalidPeerId, { count })).to.eventually.be.rejected()
    })
  })
}
