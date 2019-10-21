/* eslint-env mocha */
'use strict'

const PeerInfo = require('peer-info')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.addrs', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup({ type: 'js' })
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should get a list of node addresses', async () => {
      const peerInfos = await ipfsA.swarm.addrs()
      expect(peerInfos).to.not.be.empty()
      expect(peerInfos).to.be.an('array')
      peerInfos.forEach(m => expect(PeerInfo.isPeerInfo(m)).to.be.true())
    })
  })
}
