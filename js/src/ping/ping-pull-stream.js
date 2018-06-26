/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')
const series = require('async/series')
const { spawnNodesWithId } = require('../utils/spawn')
const { waitUntilConnected } = require('../utils/connections')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsPingResponse, isPong } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pingPullStream', function () {
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

    it('should send the specified number of packets over pull stream', (done) => {
      let packetNum = 0
      const count = 3
      pull(
        ipfsdA.pingPullStream(ipfsdB.peerId.id, { count }),
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
      let messageNum = 0
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2
      pull(
        ipfsdA.pingPullStream(unknownPeerId, { count }),
        pull.drain((res) => {
          expectIsPingResponse(res)
          messageNum++

          // First message should be "looking up" response
          if (messageNum === 1) {
            expect(res.text).to.include('Looking up')
          }

          // Second message should be a failure response
          if (messageNum === 2) {
            expect(res.success).to.be.false()
          }
        }, (err) => {
          expect(err).to.exist()
          done()
        })
      )
    })

    it('should fail when pinging an invalid peer over pull stream', (done) => {
      const invalidPeerId = 'not a peer ID'
      const count = 2
      pull(
        ipfsdA.pingPullStream(invalidPeerId, { count }),
        pull.collect((err) => {
          expect(err).to.exist()
          expect(err.message).to.include('failed to parse peer address')
          done()
        })
      )
    })
  })
}
