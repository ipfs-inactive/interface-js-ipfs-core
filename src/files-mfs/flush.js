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

  describe('.files.flush', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not flush not found file/dir, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.flush(`${testDir}/404`, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should flush root', (done) => {
      ipfs.files.flush((err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should flush specific dir', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, { p: true }, cb),
        (cb) => ipfs.files.flush(testDir, cb)
      ], (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })
}
