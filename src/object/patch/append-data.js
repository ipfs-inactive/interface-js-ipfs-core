/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.appendData', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should append data to an existing node', async () => {
      const obj = {
        Data: Buffer.from('patch test object'),
        Links: []
      }

      const nodeCid = await ipfs.object.put(obj)
      const patchedNodeCid = await ipfs.object.patch.appendData(nodeCid, Buffer.from('append'))
      expect(patchedNodeCid).to.not.deep.equal(nodeCid)
    })

    it('returns error for request without key & data', async () => {
      try {
        await ipfs.object.patch.appendData(null, null)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })

    it('returns error for request without data', async () => {
      const filePath = 'test/fixtures/test-data/badnode.json'

      try {
        await ipfs.object.patch.appendData(null, filePath)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })
  })
}
