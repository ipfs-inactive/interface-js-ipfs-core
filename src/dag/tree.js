/* eslint-env mocha */
'use strict'

const series = require('async/series')
const eachSeries = require('async/eachSeries')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.tree', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    let nodePb
    let nodeCbor
    let cidPb
    let cidCbor

    before(function (done) {
      series([
        (cb) => {
          try {
            nodePb = new DAGNode(Buffer.from('I am inside a Protobuf'))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          dagPB.util.cid(nodePb.serialize())
            .then(cid => {
              cidPb = cid
              cb()
            }, cb)
        },
        (cb) => {
          nodeCbor = {
            someData: 'I am inside a Cbor object',
            pb: cidPb
          }

          dagCBOR.util.cid(dagCBOR.util.serialize(nodeCbor))
            .then(cid => {
              cidCbor = cid
              cb()
            }, cb)
        },
        (cb) => {
          eachSeries([
            { node: nodePb, multicodec: 'dag-pb', hashAlg: 'sha2-256' },
            { node: nodeCbor, multicodec: 'dag-cbor', hashAlg: 'sha2-256' }
          ], (el, cb) => {
            ipfs.dag.put(el.node, {
              format: el.multicodec,
              hashAlg: el.hashAlg
            }, cb)
          }, cb)
        }
      ], done)
    })

    it('should get tree with CID', (done) => {
      ipfs.dag.tree(cidCbor, (err, paths) => {
        expect(err).to.not.exist()
        expect(paths).to.eql([
          'pb',
          'someData'
        ])
        done()
      })
    })

    it('should get tree with CID and path', (done) => {
      ipfs.dag.tree(cidCbor, 'someData', (err, paths) => {
        expect(err).to.not.exist()
        expect(paths).to.eql([])
        done()
      })
    })

    it('should get tree with CID and path as String', (done) => {
      const cidCborStr = cidCbor.toBaseEncodedString()

      ipfs.dag.tree(cidCborStr + '/someData', (err, paths) => {
        expect(err).to.not.exist()
        expect(paths).to.eql([])
        done()
      })
    })

    it('should get tree with CID recursive (accross different formats)', (done) => {
      ipfs.dag.tree(cidCbor, { recursive: true }, (err, paths) => {
        expect(err).to.not.exist()
        expect(paths).to.have.members([
          'pb',
          'someData',
          'pb/Links',
          'pb/Data'
        ])
        done()
      })
    })

    it('should get tree with CID and path recursive', (done) => {
      ipfs.dag.tree(cidCbor, 'pb', { recursive: true }, (err, paths) => {
        expect(err).to.not.exist()
        expect(paths).to.have.members([
          'Links',
          'Data'
        ])
        done()
      })
    })
  })
}
