/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.config.profiles.list', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
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
