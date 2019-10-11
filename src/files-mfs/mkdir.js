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

  describe('.files.mkdir', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should make directory on root', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mkdir(testDir, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should make directory and its parents', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mkdir(`${testDir}/lv1/lv2`, { p: true }, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should not make already existent directory', (done) => {
      ipfs.files.mkdir('/', (err) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
