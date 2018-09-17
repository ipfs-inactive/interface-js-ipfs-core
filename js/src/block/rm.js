/* eslint-env mocha */
'use strict'

const CID = require('cids')
const auto = require('async/auto')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.rm', function () {
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

    it('should remove by CID object', (done) => {
      const cid = new CID(hash)
      ipfs.block.rm(cid, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should error on removing non-existent block', (done) => {
      const cid = new CID('QmYi5NFboBxXvdoRDSa7LaLcQvCukULCaDbZKXUXz4umPa')
      ipfs.block.rm(cid, (err, block) => {
        expect(err).to.exist()
        done()
      })
    })

    // TODO it.skip('Promises support', (done) => {})
  })
}
