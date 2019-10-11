/* eslint-env mocha */
'use strict'

const pump = require('pump')
const { Writable } = require('stream')
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

  describe('.pingReadableStream', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should send the specified number of packets over readable stream', (done) => {
      let packetNum = 0
      const count = 3

      pump(
        ipfsA.pingReadableStream(ipfsB.peerId.id, { count }),
        new Writable({
          objectMode: true,
          write (res, enc, cb) {
            expect(res.success).to.be.true()
            // It's a pong
            if (isPong(res)) {
              packetNum++
            }

            cb()
          }
        }),
        (err) => {
          expect(err).to.not.exist()
          expect(packetNum).to.equal(count)
          done()
        }
      )
    })

    it('should fail when pinging peer that is not available over readable stream', (done) => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'

      pump(
        ipfsA.pingReadableStream(unknownPeerId, {}),
        new Writable({
          objectMode: true,
          write: (res, enc, cb) => cb()
        }),
        (err) => {
          expect(err).to.exist()
          done()
        }
      )
    })

    it('should fail when pinging an invalid peer id over readable stream', (done) => {
      const invalidPeerId = 'not a peer ID'

      pump(
        ipfsA.pingReadableStream(invalidPeerId, {}),
        new Writable({
          objectMode: true,
          write: (chunk, enc, cb) => cb()
        }),
        (err) => {
          expect(err).to.exist()
          done()
        }
      )
    })
  })
}
