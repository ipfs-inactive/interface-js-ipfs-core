/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')
const { asDAGLink } = require('../utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.patch.rmLink', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

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

    it('returns error for request without arguments', () => {
      return expect(ipfs.object.patch.rmLink(null, null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('returns error for request only one invalid argument', () => {
      return expect(ipfs.object.patch.rmLink('invalid', null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid first argument', () => {
      const root = ''
      const link = 'foo'

      return expect(ipfs.object.patch.rmLink(root, link)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}
