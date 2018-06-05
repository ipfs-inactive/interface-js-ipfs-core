/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multihash = require('multihashes')
const CID = require('cids')
const Buffer = require('safe-buffer').Buffer
const auto = require('async/auto')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.get', function () {
    const data = Buffer.from('blorb')
    let ipfs, hash

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      auto({
        factory: (cb) => common.setup(cb),
        ipfs: ['factory', (res, cb) => res.factory.spawnNode(cb)],
        block: ['ipfs', (res, cb) => res.ipfs.block.put(data, cb)]
      }, (err, res) => {
        if (err) return done(err)
        ipfs = res.ipfs
        hash = res.block.cid.multihash
        done()
      })
    })

    after((done) => common.teardown(done))

    it('should get by CID object', (done) => {
      const cid = new CID(hash)

      ipfs.block.get(cid, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(new Buffer('blorb'))
        expect(block.cid.multihash).to.eql(cid.multihash)
        done()
      })
    })

    it('should get by CID in string', (done) => {
      ipfs.block.get(multihash.toB58String(hash), (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(new Buffer('blorb'))
        expect(block.cid.multihash).to.eql(hash)
        done()
      })
    })

    // TODO it.skip('Promises support', (done) => {})
  })
}
