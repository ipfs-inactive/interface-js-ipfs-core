/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const PeerId = require('peer-id')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
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
      ipfsA = (await common.spawn()).api
      ipfsB = (await common.spawn({ type: 'js' })).api
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.clean())

    it('should disconnect from a peer', async () => {
      let peers

      peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length.above(0)

      await ipfsA.swarm.disconnect(PeerId.createFromCID(ipfsB.peerId.id))

      peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length(0)
    })
  })
}
