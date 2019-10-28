/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { asDAGLink } = require('./utils')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.links', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get empty links by multihash', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)
      const links = await ipfs.object.links(cid)

      expect(node.Links).to.eql(links)
    })

    it('should get links by multihash', async () => {
      const node1a = new DAGNode(Buffer.from('Some data 1'))
      const node2 = new DAGNode(Buffer.from('Some data 2'))

      const link = await asDAGLink(node2, 'some-link')

      const node1b = new DAGNode(node1a.Data, node1a.Links.concat(link))
      const node1bCid = await ipfs.object.put(node1b)

      const links = await ipfs.object.links(node1bCid)
      expect(node1b.Links[0]).to.eql({
        Hash: links[0].Hash,
        Tsize: links[0].Tsize,
        Name: links[0].Name
      })
    })

    it('should get links by base58 encoded multihash', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)

      const links = await ipfs.object.links(cid.buffer, { enc: 'base58' })
      expect(node.Links).to.deep.equal(links)
    })

    it('should get links by base58 encoded multihash string', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)

      const links = await ipfs.object.links(cid.toBaseEncodedString(), { enc: 'base58' })
      expect(node.Links).to.deep.equal(links)
    })

    it('should get links from CBOR object', async () => {
      const hashes = []

      const res1 = await ipfs.add(Buffer.from('test data'))
      hashes.push(res1[0].hash)

      const res2 = await ipfs.add(Buffer.from('more test data'))
      hashes.push(res2[0].hash)

      const obj = {
        some: 'data',
        mylink: new CID(hashes[0]),
        myobj: {
          anotherLink: new CID(hashes[1])
        }
      }
      const cid = await ipfs.dag.put(obj)

      const links = await ipfs.object.links(cid)
      expect(links.length).to.eql(2)

      // TODO: js-ipfs succeeds but go returns empty strings for link name
      // const names = [links[0].name, links[1].name]
      // expect(names).includes('mylink')
      // expect(names).includes('myobj/anotherLink')

      const cids = [links[0].Hash.toString(), links[1].Hash.toString()]
      expect(cids).includes(hashes[0])
      expect(cids).includes(hashes[1])
    })

    it('returns error for request without argument', async () => {
      try {
        await ipfs.object.links(null)
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })

    it('returns error for request with invalid argument', async () => {
      try {
        await ipfs.object.links('invalid', { enc: 'base58' })
        expect.fail('should have returned an error for invalid argument')
      } catch (err) {
        expect(err).to.be.an.instanceof(Error)
      }
    })
  })
}
