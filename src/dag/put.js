/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')
const CID = require('cids')
const multihash = require('multihashes')
const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dag.put', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    let pbNode
    let cborNode

    before((done) => {
      const someData = Buffer.from('some data')

      try {
        pbNode = new DAGNode(someData)
      } catch (err) {
        return done(err)
      }

      cborNode = {
        data: someData
      }

      done()
    })

    it('should put dag-pb with default hash func (sha2-256)', () => {
      return ipfs.dag.put(pbNode, {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      })
    })

    it('should put dag-pb with custom hash func (sha3-512)', () => {
      return ipfs.dag.put(pbNode, {
        format: 'dag-pb',
        hashAlg: 'sha3-512'
      })
    })

    it('should put dag-cbor with default hash func (sha2-256)', () => {
      return ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })
    })

    it('should put dag-cbor with custom hash func (sha3-512)', () => {
      return ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha3-512'
      })
    })

    it('should return the cid', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })
      expect(cid).to.exist()
      expect(CID.isCID(cid)).to.equal(true)

      const _cid = await dagCBOR.util.cid(dagCBOR.util.serialize(cborNode))
      expect(cid.buffer).to.eql(_cid.buffer)
    })

    it('should not fail when calling put without options', () => {
      return ipfs.dag.put(cborNode)
    })

    it('should set defaults when calling put without options', async () => {
      const cid = await ipfs.dag.put(cborNode)
      expect(cid.codec).to.equal('dag-cbor')
      expect(multihash.decode(cid.multihash).name).to.equal('sha2-256')
    })

    it('should override hash algoritm default and resolve with it', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha3-512'
      })
      expect(cid.codec).to.equal('dag-cbor')
      expect(multihash.decode(cid.multihash).name).to.equal('sha3-512')
    })

    it.skip('should put by passing the cid instead of format and hashAlg', (done) => {})
  })
}
