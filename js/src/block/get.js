/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multihash = require('multihashes')
const CID = require('cids')
const Buffer = require('safe-buffer').Buffer
const { getDescribe } = require('../utils/mocha')

module.exports = (common, options) => {
  const describe = getDescribe(options)

  describe('.block.get', function () {
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

    it('should get by CID object', (done) => {
      const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(hash)

      ipfs.block.get(cid, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(new Buffer('blorb'))
        expect(block.cid.multihash).to.eql(cid.multihash)
        done()
      })
    })

    it('should get by CID in string', (done) => {
      const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

      ipfs.block.get(hash, (err, block) => {
        expect(err).to.not.exist()
        expect(block.data).to.eql(new Buffer('blorb'))
        expect(block.cid.multihash).to.eql(multihash.fromB58String(hash))
        done()
      })
    })

    // TODO it.skip('Promises support', (done) => {})
  })
}
