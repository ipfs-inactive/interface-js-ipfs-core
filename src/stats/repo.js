/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.repo', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get repo stats', (done) => {
      ipfs.stats.repo((err, res) => {
        expectIsRepo(err, res)
        done()
      })
    })

    it('should get repo stats (promised)', () => {
      return ipfs.stats.repo().then((res) => {
        expectIsRepo(null, res)
      })
    })
  })
}
