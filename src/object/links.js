/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { asDAGLink } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.links', function () {
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

    it('should get empty links by multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()

          ipfs.object.links(cid, (err, links) => {
            expect(err).to.not.exist()
            expect(node.Links).to.deep.equal(links)
            done()
          })
        })
      })
    })

    it('should get empty links by multihash (promised)', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)
      const links = await ipfs.object.links(cid)

      expect(node.Links).to.eql(links)
    })

    it('should get links by multihash', (done) => {
      const node1a = DAGNode.create(Buffer.from('Some data 1'))
      let node1b
      let node1bCid
      const node2 = DAGNode.create(Buffer.from('Some data 2'))

      series([
        (cb) => {
          asDAGLink(node2, 'some-link')
            .then(link => DAGNode.addLink(node1a, link))
            .then(node => { node1b = node })
            .then(() => dagPB.util.cid(dagPB.util.serialize(node1b)))
            .then(cid => { node1bCid = cid })
            .then(cb)
            .catch(cb)
        },
        (cb) => {
          ipfs.object.put(node1b, (cb))
        },
        (cb) => {
          ipfs.object.links(node1bCid, (err, links) => {
            expect(err).to.not.exist()
            expect({
              cid: node1b.Links[0].Hash.toString(),
              name: node1b.Links[0].Name,
              size: node1b.Links[0].Tsize
            }).to.eql(links[0].toJSON())
            cb()
          })
        }
      ], done)
    })

    it('should get links by base58 encoded multihash', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()

          ipfs.object.links(cid.buffer, { enc: 'base58' }, (err, links) => {
            expect(err).to.not.exist()
            expect(node.Links).to.deep.equal(links)
            done()
          })
        })
      })
    })

    it('should get links by base58 encoded multihash string', (done) => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()

          ipfs.object.links(cid.toBaseEncodedString(), { enc: 'base58' }, (err, links) => {
            expect(err).to.not.exist()
            expect(node.Links).to.deep.equal(links)
            done()
          })
        })
      })
    })
  })
}
