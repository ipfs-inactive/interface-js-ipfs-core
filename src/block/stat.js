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

    it('should stat by CID', async () => {
      const cid = new CID(hash)

      const stats = await ipfs.block.stat(cid)

      expect(stats).to.have.property('key')
      expect(stats).to.have.property('size')
    })

    it('should return error for missing argument', async () => {
      try {
        await ipfs.block.stat(null)
        expect.fail('should have thrown for missing parameter')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })

    it('should return error for invalid argument', async () => {
      try {
        await ipfs.block.stat('invalid')
        expect.fail('should have thrown for invalid parameter')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })
  })
}
