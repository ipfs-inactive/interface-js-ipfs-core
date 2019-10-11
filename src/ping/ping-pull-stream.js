/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isPong } = require('./utils.js')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pingPullStream', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should send the specified number of packets over pull stream', (done) => {
      let packetNum = 0
      const count = 3
      pull(
        ipfsA.pingPullStream(ipfsB.peerId.id, { count }),
        pull.drain((res) => {
          expect(res.success).to.be.true()
          // It's a pong
          if (isPong(res)) {
            packetNum++
          }
        }, (err) => {
          expect(err).to.not.exist()
          expect(packetNum).to.equal(count)
          done()
        })
      )
    })

    it('should fail when pinging an unknown peer over pull stream', (done) => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2
      pull(
        ipfsA.pingPullStream(unknownPeerId, { count }),
        pull.collect((err, results) => {
          expect(err).to.exist()
          done()
        })
      )
    })

    it('should fail when pinging an invalid peer id over pull stream', (done) => {
      const invalidPeerId = 'not a peer ID'
      const count = 2
      pull(
        ipfsA.pingPullStream(invalidPeerId, { count }),
        pull.collect((err, results) => {
          expect(err).to.exist()
          done()
        })
      )
    })
  })
}
