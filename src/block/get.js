/* eslint-env mocha */
'use strict'

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

  describe('.block.get', function () {
    this.timeout(60 * 1000)
    const data = Buffer.from('blorb')
    let ipfs, hash

    before(async () => {
      ipfs = await common.setup()
      const block = await ipfs.block.put(data)
      hash = block.cid.multihash
    })

    after(() => common.teardown())

    it('should get by CID object', (done) => {
      const cid = new CID(hash)

      ipfs.block.get(cid, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(Buffer.from('blorb'))
        expect(block.cid.multihash).to.eql(cid.multihash)
        done()
      })
    })

    it('should get by CID in string', (done) => {
      ipfs.block.get(multihash.toB58String(hash), (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(Buffer.from('blorb'))
        expect(block.cid.multihash).to.eql(hash)
        done()
      })
    })

    it('should get an empty block', (done) => {
      ipfs.block.put(Buffer.alloc(0), {
        format: 'dag-pb',
        mhtype: 'sha2-256',
        version: 0
      }, (err, block) => {
        expect(err).to.not.exist()

        ipfs.block.get(block.cid, (err, block) => {
          expect(err).to.not.exist()
          expect(block.data).to.eql(Buffer.alloc(0))
          done()
        })
      })
    })

    it('should get a block added as CIDv0 with a CIDv1', done => {
      const input = Buffer.from(`TEST${Date.now()}`)

      ipfs.block.put(input, { version: 0 }, (err, res) => {
        expect(err).to.not.exist()

        const cidv0 = res.cid
        expect(cidv0.version).to.equal(0)

        const cidv1 = cidv0.toV1()

        ipfs.block.get(cidv1, (err, output) => {
          expect(err).to.not.exist()
          expect(output.data).to.eql(input)
          done()
        })
      })
    })

    it('should get a block added as CIDv1 with a CIDv0', done => {
      const input = Buffer.from(`TEST${Date.now()}`)

      ipfs.block.put(input, { version: 1 }, (err, res) => {
        expect(err).to.not.exist()

        const cidv1 = res.cid
        expect(cidv1.version).to.equal(1)

        const cidv0 = cidv1.toV0()

        ipfs.block.get(cidv0, (err, output) => {
          expect(err).to.not.exist()
          expect(output.data).to.eql(input)
          done()
        })
      })
    })

    it('should return an error for an invalid CID', () => {
      return ipfs.block.get('invalid')
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })
  })
}
