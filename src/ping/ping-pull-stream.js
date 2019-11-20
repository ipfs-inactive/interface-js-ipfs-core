/* eslint-env mocha */
'use strict'

const pullToPromise = require('pull-to-promise')
const series = require('async/series')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isPong } = require('./utils.js')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pingPullStream', function () {
    // TODO revisit when https://github.com/ipfs/go-ipfs/issues/5799 is resolved
    this.timeout(2 * 60 * 1000)

    let ipfsA
    let ipfsB

    before(function (done) {
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

    it('should send the specified number of packets over pull stream', async () => {
      const count = 3

      const results = await pullToPromise.any(ipfsA.pingPullStream(ipfsB.peerId.id, { count }))

      const packetNum = results.reduce((acc, result) => {
        expect(result.success).to.be.true()

        if (isPong(result)) {
          acc++
        }

        return acc
      }, 0)

      expect(packetNum).to.equal(count)
    })

    it('should fail when pinging an unknown peer over pull stream', () => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      return expect(pullToPromise.any(ipfsA.pingPullStream(unknownPeerId, { count })))
        .to.eventually.be.rejected()
    })

    it('should fail when pinging an invalid peer id over pull stream', () => {
      const invalidPeerId = 'not a peer ID'
      const count = 2

      return expect(pullToPromise.any(ipfsA.pingPullStream(invalidPeerId, { count })))
        .to.eventually.be.rejected()
    })
  })
}
