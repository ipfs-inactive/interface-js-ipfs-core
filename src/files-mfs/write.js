/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.write', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not write to non existent file, expect error', function (done) {
      const testDir = `/test-${hat()}`

      ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should write to non existent file with create flag', function (done) {
      const testPath = `/test-${hat()}`

      ipfs.files.write(testPath, Buffer.from('Hello, world!'), { create: true }, (err) => {
        expect(err).to.not.exist()

        ipfs.files.stat(testPath, (err, stats) => {
          expect(err).to.not.exist()
          expect(stats.type).to.equal('file')
          done()
        })
      })
    })

    it('should write to deeply nested non existent file with create and parents flags', function (done) {
      const testPath = `/foo/bar/baz/test-${hat()}`

      ipfs.files.write(testPath, Buffer.from('Hello, world!'), { create: true, parents: true }, (err) => {
        expect(err).to.not.exist()

        ipfs.files.stat(testPath, (err, stats) => {
          expect(err).to.not.exist()
          expect(stats.type).to.equal('file')
          done()
        })
      })
    })
  })
}
