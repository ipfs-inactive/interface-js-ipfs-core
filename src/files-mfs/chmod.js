/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.chmod', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should change file mode', async function () {
      const testPath = `/test-${hat()}`
      const finalMode = parseInt('544', 8)

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true
      })
      await ipfs.files.chmod(testPath, finalMode)

      const stat = await ipfs.files.stat(testPath)

      expect(stat).to.have.property('mode').that.equals(finalMode)
    })

    it('should change directory mode', async function () {
      const testPath = `/test-${hat()}`
      const finalMode = parseInt('544', 8)

      await ipfs.files.mkdir(testPath, {
        create: true
      })
      await ipfs.files.chmod(testPath, finalMode)

      const stat = await ipfs.files.stat(testPath)

      expect(stat).to.have.property('mode').that.equals(finalMode)
    })
  })
}
