/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
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
      let node1a
      let node1b
      let node1bCid
      let node2

      series([
        (cb) => {
          try {
            node1a = new DAGNode(Buffer.from('Some data 1'))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          try {
            node2 = new DAGNode(Buffer.from('Some data 2'))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          asDAGLink(node2, 'some-link', (err, link) => {
            expect(err).to.not.exist()

            node1b = new DAGNode(node1a.Data, node1a.Links.concat(link))

            cb()
          })
        },
        (cb) => {
          ipfs.object.put(node1b, (err, cid) => {
            expect(err).to.not.exist()

            node1bCid = cid

            cb()
          })
        },
        (cb) => {
          ipfs.object.links(node1bCid, (err, links) => {
            expect(err).to.not.exist()
            expect(node1b.Links[0]).to.eql({
              Hash: links[0].Hash,
              Tsize: links[0].Tsize,
              Name: links[0].Name
            })
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

    it('should get links from CBOR object', (done) => {
      const hashes = []
      ipfs.add(Buffer.from('test data'), (err, res1) => {
        expect(err).to.not.exist()
        hashes.push(res1[0].hash)
        ipfs.add(Buffer.from('more test data'), (err, res2) => {
          hashes.push(res2[0].hash)
          expect(err).to.not.exist()
          const obj = {
            some: 'data',
            mylink: new CID(hashes[0]),
            myobj: {
              anotherLink: new CID(hashes[1])
            }
          }
          ipfs.dag.put(obj, (err, cid) => {
            expect(err).to.not.exist()
            ipfs.object.links(cid, (err, links) => {
              expect(err).to.not.exist()
              expect(links.length).to.eql(2)

              // TODO: js-ipfs succeeds but go returns empty strings for link name
              // const names = [links[0].name, links[1].name]
              // expect(names).includes('mylink')
              // expect(names).includes('myobj/anotherLink')

              const cids = [links[0].Hash.toString(), links[1].Hash.toString()]
              expect(cids).includes(hashes[0])
              expect(cids).includes(hashes[1])

              done()
            })
          })
        })
      })
    })

    it('returns error for request without argument', () => {
      return ipfs.object.links(null)
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })

    it('returns error for request with invalid argument', () => {
      ipfs.object.links('invalid', { enc: 'base58' })
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })
  })
}
