/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.provide', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
      const nodeB = await common.setup()
      await ipfs.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should provide local CID', (done) => {
      ipfs.add(Buffer.from('test'), (err, res) => {
        if (err) return done(err)

        ipfs.dht.provide(new CID(res[0].hash), (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should not provide if block not found locally', (done) => {
      const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      ipfs.dht.provide(cid, (err) => {
        expect(err).to.exist()
        expect(err.message).to.include('not found locally')
        done()
      })
    })

    it('should allow multiple CIDs to be passed', (done) => {
      ipfs.add([
        { content: Buffer.from('t0') },
        { content: Buffer.from('t1') }
      ], (err, res) => {
        if (err) return done(err)

        ipfs.dht.provide([
          new CID(res[0].hash),
          new CID(res[1].hash)
        ], (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should provide a CIDv1', (done) => {
      ipfs.add(Buffer.from('test'), { cidVersion: 1 }, (err, res) => {
        if (err) return done(err)

        const cid = new CID(res[0].hash)

        ipfs.dht.provide(cid, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should error on non CID arg', (done) => {
      ipfs.dht.provide({}, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should error on array containing non CID arg', (done) => {
      ipfs.dht.provide([{}], (err) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
