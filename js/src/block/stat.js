/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CID = require('cids')
const { getDescribe } = require('../utils/mocha')

module.exports = (common, options) => {
  const describe = getDescribe(options)

  describe('.block.stat', () => {
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

    it('should stat by CID', (done) => {
      const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const cid = new CID(hash)

      ipfs.block.stat(cid, (err, stats) => {
        expect(err).to.not.exist()
        expect(stats).to.have.property('key')
        expect(stats).to.have.property('size')
        done()
      })
    })

    // TODO it.skip('Promises support', (done) => {})
  })
}
