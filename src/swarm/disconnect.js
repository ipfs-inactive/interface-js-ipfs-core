/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.disconnect', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should disconnect from a peer', (done) => {
      ipfsA.swarm.disconnect(ipfsB.peerId.addresses[0], done)
    })

    it('should disconnect from a peer (promised)', () => {
      return ipfsA.swarm.disconnect(ipfsB.peerId.addresses[0])
    })
  })
}
