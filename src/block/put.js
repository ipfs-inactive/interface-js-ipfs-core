/* eslint-env mocha */
'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')
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

  describe('.block.put', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should put a buffer, using defaults', (done) => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const blob = Buffer.from('blorb')

      ipfs.block.put(blob, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.be.eql(blob)
        expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
        done()
      })
    })

    it('should put a buffer, using CID', (done) => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(expectedHash)
      const blob = Buffer.from('blorb')

      ipfs.block.put(blob, { cid: cid }, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.be.eql(blob)
        expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
        done()
      })
    })

    it('should put a buffer, using options', (done) => {
      const blob = Buffer.from(`TEST${Date.now()}`)

      ipfs.block.put(blob, {
        format: 'raw',
        mhtype: 'sha2-512',
        version: 1
      }, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.be.eql(blob)
        expect(block.cid.version).to.equal(1)
        expect(block.cid.codec).to.equal('raw')
        expect(multihash.decode(block.cid.multihash).name).to.equal('sha2-512')
        done()
      })
    })

    it('should put a Block instance', (done) => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(expectedHash)
      const b = new Block(Buffer.from('blorb'), cid)

      ipfs.block.put(b, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(Buffer.from('blorb'))
        expect(block.cid.multihash).to.eql(multihash.fromB58String(expectedHash))
        done()
      })
    })

    it('should error with array of blocks', (done) => {
      const blob = Buffer.from('blorb')

      ipfs.block.put([blob, blob], (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })
  })
}
