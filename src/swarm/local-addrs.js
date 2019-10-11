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

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should list local addresses the node is listening on', (done) => {
      ipfs.swarm.localAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs).to.have.length.above(0)
        done()
      })
    })

    it('should list local addresses the node is listening on (promised)', () => {
      return ipfs.swarm.localAddrs().then((multiaddrs) => {
        expect(multiaddrs).to.have.length.above(0)
      })
    })
  })
}
