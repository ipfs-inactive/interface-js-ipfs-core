/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.repo.version', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get the repo version', (done) => {
      ipfs.repo.version((err, version) => {
        expect(err).to.not.exist()
        expect(version).to.exist()
        done()
      })
    })

    it('should get the repo version (promised)', () => {
      return ipfs.repo.version().then((version) => {
        expect(version).to.exist()
      })
    })
  })
}
