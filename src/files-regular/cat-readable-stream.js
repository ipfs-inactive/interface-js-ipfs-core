/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const bl = require('bl')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.catReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
      await ipfs.add(fixtures.bigFile.data)
      await ipfs.add(fixtures.smallFile.data)
    })

    after(() => common.teardown())

    it('should return a Readable Stream for a CID', () => {
      const stream = ipfs.catReadableStream(fixtures.bigFile.cid)

      return new Promise((resolve) => {
        stream.pipe(bl((err, data) => {
          expect(err).to.not.exist()
          expect(data).to.eql(fixtures.bigFile.data)
          resolve()
        }))
      })
    })

    it('should export a chunk of a file in a Readable Stream', () => {
      const offset = 1
      const length = 3

      const stream = ipfs.catReadableStream(fixtures.smallFile.cid, {
        offset,
        length
      })

      return new Promise((resolve) => {
        stream.pipe(bl((err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.equal('lz ')
          resolve()
        }))
      })
    })
  })
}
