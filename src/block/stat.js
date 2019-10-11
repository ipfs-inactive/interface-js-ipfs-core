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

  describe('.block.stat', function () {
    this.timeout(60 * 1000)
    const data = Buffer.from('blorb')
    let ipfs, hash

    before(async () => {
      ipfs = await common.setup()
      const block = await ipfs.block.put(data)
      hash = block.cid.multihash
    })

    after(() => common.teardown())

    it('should stat by CID', (done) => {
      const cid = new CID(hash)

      ipfs.block.stat(cid, (err, stats) => {
        expect(err).to.not.exist()
        expect(stats).to.have.property('key')
        expect(stats).to.have.property('size')
        done()
      })
    })

    it('should return error for missing argument', () => {
      return ipfs.block.stat(null)
        .then(
          () => expect.fail('should have thrown for missing parameter'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })

    it('should return error for invalid argument', () => {
      return ipfs.block.stat('invalid')
        .then(
          () => expect.fail('should have thrown for invalid parameter'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })
  })
}
