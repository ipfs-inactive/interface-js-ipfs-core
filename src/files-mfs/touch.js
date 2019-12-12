/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('delay')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.touch', function () {
    this.timeout(10 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })
    before(async () => { await ipfs.add(fixtures.smallFile.data) })

    after(() => common.teardown())

    it('should update file mtime', async function () {
      this.slow(5 * 1000)
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true,
        mtime: Math.round(Date.now() / 1000)
      })

      const stat = await ipfs.files.stat(testPath)

      await delay(2000)

      await ipfs.files.touch(testPath)

      const stat2 = await ipfs.files.stat(testPath)

      expect(stat2).to.have.property('mtime').that.is.greaterThan(stat.mtime)
    })

    it('should update directory mtime', async function () {
      this.slow(5 * 1000)
      const testPath = `/test-${hat()}`

      await ipfs.files.mkdir(testPath, {
        create: true,
        mtime: Math.round(Date.now() / 1000)
      })

      const stat = await ipfs.files.stat(testPath)

      await delay(2000)

      await ipfs.files.touch(testPath)

      const stat2 = await ipfs.files.stat(testPath)

      expect(stat2).to.have.property('mtime').that.is.greaterThan(stat.mtime)
    })
  })
}
