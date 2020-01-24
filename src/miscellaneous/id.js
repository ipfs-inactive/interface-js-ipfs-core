/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const Multiaddr = require('multiaddr')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.id', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get the node ID', async () => {
      const res = await ipfs.id()
      expect(res).to.have.a.property('id').that.is.a('string')
      expect(res).to.have.a.property('publicKey')
      expect(res).to.have.a.property('addresses').that.is.an('array').and.all.satisfy(ma => {
        const isString = (ma instanceof String || typeof ma === 'string')
        const asString = new Multiaddr(ma).toString()

        // TODO: remove when go-IPFS returns nu-school /p2p/ multiaddrs
        if (ma.includes('/ipfs/')) {
          ma = ma.replace(/ipfs/g, 'p2p')
        }

        return isString && asString === ma
      })
      expect(res).to.have.a.property('agentVersion').that.is.a('string')
      expect(res).to.have.a.property('protocolVersion').that.is.a('string')
    })
  })
}
