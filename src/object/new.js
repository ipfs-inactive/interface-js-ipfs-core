/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.new', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should create a new object with no template', (done) => {
      ipfs.object.new((err, cid) => {
        expect(err).to.not.exist()
        expect(cid.toBaseEncodedString()).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        done()
      })
    })

    it('should create a new object with no template (promised)', async () => {
      const cid = await ipfs.object.new()
      expect(cid.toBaseEncodedString()).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    })

    it('should create a new object with unixfs-dir template', (done) => {
      ipfs.object.new('unixfs-dir', (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.toBaseEncodedString()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
        done()
      })
    })

    it('should create a new object with unixfs-dir template (promised)', async () => {
      const cid = await ipfs.object.new('unixfs-dir')
      expect(cid.toBaseEncodedString()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })
  })
}
