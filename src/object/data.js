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

    it('should get data by multihash', async () => {
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
      expect(testObj.Data).to.eql(data)
    })

    it('should get data by base58 encoded multihash', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      let data = await ipfs.object.data(bs58.encode(nodeCid.buffer), { enc: 'base58' })
      // because js-ipfs-api can't infer
      // if the returned Data is Buffer or String
      if (typeof data === 'string') {
        data = Buffer.from(data)
      }
      expect(testObj.Data).to.eql(data)
    })

    it('should get data by base58 encoded multihash string', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const nodeCid = await ipfs.object.put(testObj)

      let data = await ipfs.object.data(bs58.encode(nodeCid.buffer).toString(), { enc: 'base58' })
      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof data === 'string') {
        data = Buffer.from(data)
      }
      expect(testObj.Data).to.eql(data)
    })

    it('returns error for request without argument', async () => {
      try {
        await ipfs.object.data(null)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })

    it('returns error for request with invalid argument', async () => {
      try {
        await ipfs.object.data('invalid', { enc: 'base58' })
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })
  })
}
