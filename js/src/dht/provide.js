/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const CID = require('cids')
const { getDescribe, getIt } = require('../utils/mocha')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.provide', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should provide local CID', (done) => {
      ipfs.files.add(Buffer.from('test'), (err, res) => {
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
      ipfs.files.add([Buffer.from('t0'), Buffer.from('t1')], (err, res) => {
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
      ipfs.files.add(Buffer.from('test'), { 'cid-version': 1 }, (err, res) => {
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
