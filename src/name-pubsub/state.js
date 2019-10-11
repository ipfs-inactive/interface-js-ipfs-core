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

  describe('.name.pubsub.state', function () {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get the current state of pubsub', function (done) {
      this.timeout(50 * 1000)

      ipfs.name.pubsub.state((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.property('enabled')
        expect(res.enabled).to.be.eql(true)

        done()
      })
    })
  })
}
