/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')
/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.profiles.list', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should list config profiles', async () => {
      const profiles = await ipfs.config.profiles.list()

      expect(profiles).to.be.an('array')
      expect(profiles).not.to.be.empty()

      profiles.forEach(profile => {
        expect(profile.name).to.be.a('string')
        expect(profile.description).to.be.a('string')
      })
    })
  })
}
