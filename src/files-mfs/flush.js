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

  describe('.files.flush', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should not flush not found file/dir, expect error', async () => {
      const testDir = `/test-${hat()}`

      try {
        await ipfs.files.flush(`${testDir}/404`)
      } catch (err) {
        expect(err).to.exist()
      }
    })

    it('should flush root', () => ipfs.files.flush())

    it('should flush specific dir', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.flush(testDir)
    })
  })
}
