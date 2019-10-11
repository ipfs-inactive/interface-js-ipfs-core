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

  describe('.stop', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    // must be last test to run
    it('should stop the node', function (done) {
      this.timeout(10 * 1000)

      ipfs.stop((err) => {
        expect(err).to.not.exist()

        // Trying to stop an already stopped node should return an error
        // as the node can't respond to requests anymore
        ipfs.stop((err) => {
          expect(err).to.exist()
          done()
        })
      })
    })
  })
}
