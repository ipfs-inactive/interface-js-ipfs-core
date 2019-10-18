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

  describe('.files.rm', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not remove not found file/dir, expect error', async () => {
      const testDir = `/test-${hat()}`

      try {
        await ipfs.files.rm(`${testDir}/a`)
        expect.fail('files.read() did not throw when removing not found file/dir')
      } catch (err) {
        expect(err).to.exist()
      }
    })

    it('should remove file, expect no error', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { p: true })
      await ipfs.files.write(`${testDir}/c`, Buffer.from('Hello, world!'), { create: true })

      await ipfs.files.rm(`${testDir}/c`)

      const contents = await ipfs.files.ls(testDir)
      expect(contents).to.be.an('array').and.to.be.empty()
    })

    it('should remove dir, expect no error', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1/lv2`, { p: true })

      await ipfs.files.rm(`${testDir}/lv1/lv2`, { recursive: true })

      const lv1Contents = await ipfs.files.ls(`${testDir}/lv1`)
      expect(lv1Contents).to.be.an('array').and.to.be.empty()
    })
  })
}
