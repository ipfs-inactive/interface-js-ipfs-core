/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const pull = require('pull-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.catPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    before(() => ipfs.add(fixtures.smallFile.data))
    after(() => common.teardown())

    it('should return a Pull Stream for a CID', () => {
      const stream = ipfs.catPullStream(fixtures.smallFile.cid)

      return new Promise((resolve) => {
        pull(
          stream,
          pull.concat((err, data) => {
            expect(err).to.not.exist()
            expect(data.length).to.equal(fixtures.smallFile.data.length)
            expect(data).to.eql(fixtures.smallFile.data.toString())
            resolve()
          })
        )
      })
    })

    it('should export a chunk of a file in a Pull Stream', () => {
      const offset = 1
      const length = 3

      const stream = ipfs.catPullStream(fixtures.smallFile.cid, {
        offset,
        length
      })

      return new Promise((resolve) => {
        pull(
          stream,
          pull.concat((err, data) => {
            expect(err).to.not.exist()
            expect(data.toString()).to.equal('lz ')
            resolve()
          })
        )
      })
    })
  })
}
