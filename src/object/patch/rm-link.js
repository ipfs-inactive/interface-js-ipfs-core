/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')
const { asDAGLink } = require('../utils')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.rmLink', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should remove a link from an existing node', async () => {
      const obj1 = {
        Data: Buffer.from('patch test object 1'),
        Links: []
      }

      const obj2 = {
        Data: Buffer.from('patch test object 2'),
        Links: []
      }

      const nodeCid = await ipfs.object.put(obj1)
      const childCid = await ipfs.object.put(obj2)
      const child = await ipfs.object.get(childCid)
      const childAsDAGLink = await asDAGLink(child, 'my-link')
      const parentCid = await ipfs.object.patch.addLink(nodeCid, childAsDAGLink)
      const withoutChildCid = await ipfs.object.patch.rmLink(parentCid, childAsDAGLink)

      expect(withoutChildCid).to.not.deep.equal(parentCid)
      expect(withoutChildCid).to.deep.equal(nodeCid)

      /* TODO: revisit this assertions.
      const node = await ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLinkPlainObject)
      expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
      */
    })

    it('returns error for request without arguments', async () => {
      try {
        await ipfs.object.patch.rmLink(null, null)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })

    it('returns error for request only one invalid argument', async () => {
      try {
        await ipfs.object.patch.rmLink('invalid', null)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })

    it('returns error for request with invalid first argument', async () => {
      const root = ''
      const link = 'foo'

      try {
        await ipfs.object.patch.rmLink(root, link)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })
  })
}
