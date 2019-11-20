/* eslint-env mocha */
'use strict'

const CID = require('cids')
const auto = require('async/auto')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.stat', () => {
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

    it('should stat by CID', async () => {
      const cid = new CID(hash)

      const stats = await ipfs.block.stat(cid)

      expect(stats).to.have.property('key')
      expect(stats).to.have.property('size')
    })

    it('should return error for missing argument', () => {
      return expect(ipfs.block.stat(null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return error for invalid argument', () => {
      return expect(ipfs.block.stat('invalid')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}
