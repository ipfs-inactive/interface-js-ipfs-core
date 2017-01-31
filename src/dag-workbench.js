/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-pb')
// const series = require('async/series')

module.exports = (common) => {
  describe('.dag.workbench', () => {
    let ipfs

    before(function (done) {
      // CI is slow
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
    })

    describe('promise API', () => {
    })
  })
}
