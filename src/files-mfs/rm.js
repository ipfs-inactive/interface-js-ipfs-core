/* eslint-env mocha */
'use strict'

const series = require('async/series')
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

  describe('.files.rm', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not remove not found file/dir, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.rm(`${testDir}/a`, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should remove file, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, { p: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/c`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.rm(`${testDir}/c`, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should remove dir, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mkdir(`${testDir}/lv1/lv2`, { p: true }, (err) => {
        expect(err).to.not.exist()

        ipfs.files.rm(`${testDir}/lv1/lv2`, { recursive: true }, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })
}
