/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
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

  describe('.object.patch.addLink', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should add a link to an existing node', async () => {
      const obj = {
        Data: Buffer.from('patch test object'),
        Links: []
      }

      const testNodeCid = await ipfs.object.put(obj)
      const node1a = new DAGNode(obj.Data, obj.Links)
      const node2 = new DAGNode(Buffer.from('some other node'))

      // note: we need to put the linked obj, otherwise IPFS won't
      // timeout. Reason: it needs the node to get its size
      await ipfs.object.put(node2)

      const link = await asDAGLink(node2, 'link-to-node')
      const node1b = new DAGNode(node1a.Data, node1a.Links.concat(link))

      const node1bCid = await ipfs.object.put(node1b)

      const cid = await ipfs.object.patch.addLink(testNodeCid, node1b.Links[0])
      expect(node1bCid).to.eql(cid)

      /* TODO: revisit this assertions.
      // note: make sure we can link js plain objects
      const content = Buffer.from(JSON.stringify({
        title: 'serialized object'
      }, null, 0))

      const result = await ipfs.add(content)
      expect(result).to.exist()
      expect(result).to.have.lengthOf(1)

      const object = result.pop()
      const node3 = {
        name: object.hash,
        multihash: object.hash,
        size: object.size
      }

      const node = await ipfs.object.patch.addLink(testNodeWithLinkMultihash, node3)
      expect(node).to.exist()
      testNodeWithLinkMultihash = node.multihash
      testLinkPlainObject = node3
      */
    })

    it('returns error for request without arguments', async () => {
      try {
        await ipfs.object.patch.addLink(null, null, null)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })

    it('returns error for request with only one invalid argument', async () => {
      try {
        await ipfs.object.patch.addLink('invalid', null, null)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })
  })
}
