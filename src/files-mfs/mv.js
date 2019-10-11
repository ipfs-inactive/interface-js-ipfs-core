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

  describe('.files.mv', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    before((done) => {
      series([
        (cb) => ipfs.files.mkdir('/test/lv1/lv2', { p: true }, cb),
        (cb) => ipfs.files.write('/test/a', Buffer.from('Hello, world!'), { create: true }, cb)
      ], done)
    })
    after(() => common.teardown())

    it('should not move not found file/dir, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mv(`${testDir}/404`, `${testDir}/a`, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should move file, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(`${testDir}/lv1/lv2`, { p: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.mv(`${testDir}/a`, `${testDir}/c`, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should move dir, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mkdir(`${testDir}/lv1/lv2`, { p: true }, (err) => {
        expect(err).to.not.exist()

        ipfs.files.mv('/test/lv1/lv2', '/test/lv1/lv4', (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })
}
