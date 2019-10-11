/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const series = require('async/series')
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

    it('should remove a link from an existing node', (done) => {
      let node1aCid
      let node1bCid
      let node2
      let node2Cid
      let testLink

      const obj1 = {
        Data: Buffer.from('patch test object 1'),
        Links: []
      }

      const obj2 = {
        Data: Buffer.from('patch test object 2'),
        Links: []
      }

      series([
        (cb) => {
          ipfs.object.put(obj1, (err, cid) => {
            expect(err).to.not.exist()
            node1aCid = cid
            cb()
          })
        },
        (cb) => {
          ipfs.object.put(obj2, (err, cid) => {
            expect(err).to.not.exist()
            node2Cid = cid

            ipfs.object.get(cid, (err, node) => {
              expect(err).to.not.exist()
              node2 = node
              cb()
            })
          })
        },
        (cb) => {
          testLink = new DAGLink('link-to-node', node2.size, node2Cid)

          ipfs.object.patch.addLink(node1aCid, testLink, (err, cid) => {
            expect(err).to.not.exist()
            node1bCid = cid
            cb()
          })
        },
        (cb) => {
          ipfs.object.patch.rmLink(node1bCid, testLink, (err, cid) => {
            expect(err).to.not.exist()
            expect(cid).to.not.deep.equal(node1bCid)
            expect(cid).to.deep.equal(node1aCid)
            cb()
          })
        }
        /* TODO: revisit this assertions.
        (cb) => {
          ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLinkPlainObject, (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
            cb()
          })
        }
        */
      ], done)
    })

    it('should remove a link from an existing node (promised)', async () => {
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
    })

    it('returns error for request without arguments', () => {
      return ipfs.object.patch.rmLink(null, null)
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })

    it('returns error for request only one invalid argument', () => {
      return ipfs.object.patch.rmLink('invalid', null)
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })

    it('returns error for request with invalid first argument', () => {
      const root = ''
      const link = 'foo'

      return ipfs.object.patch.rmLink(root, link)
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })
  })
}
