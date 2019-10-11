/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const concat = require('concat-stream')
const through = require('through2')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.getReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
      await ipfs.add(fixtures.smallFile.data)
    })

    after(() => common.teardown())

    it('should return a Readable Stream of Readable Streams', (done) => {
      const stream = ipfs.getReadableStream(fixtures.smallFile.cid)
      const files = []

      stream.pipe(through.obj((file, enc, next) => {
        file.content.pipe(concat((content) => {
          files.push({ path: file.path, content: content })
          next()
        }))
      }, () => {
        expect(files).to.be.length(1)
        expect(files[0].path).to.eql(fixtures.smallFile.cid)
        expect(files[0].content.toString()).to.contain('Plz add me!')
        done()
      }))
    })
  })
}
