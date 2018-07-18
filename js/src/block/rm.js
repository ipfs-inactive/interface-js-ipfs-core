/* eslint-env mocha */
'use strict'

const CID = require('cids')
const auto = require('async/auto')
const waterfall = require('async/waterfall')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.rm', function () {
    const data = Buffer.from('blorb')
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      auto({
        factory: (cb) => common.setup(cb),
        ipfs: ['factory', (res, cb) => res.factory.spawnNode(cb)]
      }, (err, res) => {
        if (err) return done(err)
        ipfs = res.ipfs
        done()
      })
    })

    after((done) => common.teardown(done))

    it('should rm by CID object', (done) => {
      let cid
      waterfall([
        (cb) => ipfs.block.put(data, cb),
        (block, cb) => {
          cid = new CID(block.cid.multihash)
          ipfs.block.rm(cid, cb)
        }
      ], (err, removed) => {
        expect(removed.hash).to.equal(cid.toBaseEncodedString())
        expect(removed.err).to.not.exist()
        expect(err).to.not.exist()
        done()
      })
    })

    it('should rm by base58 encoded string', (done) => {
      let cid
      waterfall([
        (cb) => ipfs.block.put(data, cb),
        (block, cb) => {
          cid = new CID(block.cid.multihash)
          ipfs.block.rm(cid.toBaseEncodedString(), cb)
        }
      ], (err, removed) => {
        expect(removed.hash).to.equal(cid.toBaseEncodedString())
        expect(removed.err).to.not.exist()
        expect(err).to.not.exist()
        done()
      })
    })
  })
}
