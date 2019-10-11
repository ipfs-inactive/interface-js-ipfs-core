/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const bs58 = require('bs58')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.data', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get data by multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, nodeCid) => {
        expect(err).to.not.exist()

        ipfs.object.data(nodeCid, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer
          // if the returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(testObj.Data).to.eql(data)
          done()
        })
      })
    })

    it('should get data by multihash (promised)', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)
      let data = await ipfs.object.data(nodeCid)

      // because js-ipfs-api can't infer
      // if the returned Data is Buffer or String
      if (typeof data === 'string') {
        data = Buffer.from(data)
      }
      expect(testObj.Data).to.deep.equal(data)
    })

    it('should get data by base58 encoded multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, nodeCid) => {
        expect(err).to.not.exist()

        ipfs.object.data(bs58.encode(nodeCid.buffer), { enc: 'base58' }, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer
          // if the returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(testObj.Data).to.eql(data)
          done()
        })
      })
    })

    it('should get data by base58 encoded multihash string', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, nodeCid) => {
        expect(err).to.not.exist()

        ipfs.object.data(bs58.encode(nodeCid.buffer).toString(), { enc: 'base58' }, (err, data) => {
          expect(err).to.not.exist()

          // because js-ipfs-api can't infer if the
          // returned Data is Buffer or String
          if (typeof data === 'string') {
            data = Buffer.from(data)
          }
          expect(testObj.Data).to.eql(data)
          done()
        })
      })
    })

    it('returns error for request without argument', () => {
      return ipfs.object.data(null)
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })

    it('returns error for request with invalid argument', () => {
      ipfs.object.data('invalid', { enc: 'base58' })
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })
  })
}
