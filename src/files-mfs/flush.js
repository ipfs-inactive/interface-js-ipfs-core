/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.flush', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

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

      await ipfs.files.mkdir(testDir, { p: true })
      await ipfs.files.flush(testDir)
    })
  })
}
