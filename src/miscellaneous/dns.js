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

  describe('.dns', function () {
    this.timeout(60 * 1000)
    this.retries(3)
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should non-recursively resolve ipfs.io', () => {
      return ipfs.dns('ipfs.io', { recursive: false }).then(res => {
      // matches pattern /ipns/<ipnsaddress>
        expect(res).to.match(/\/ipns\/.+$/)
      })
    })

    it('should recursively resolve ipfs.io', () => {
      return ipfs.dns('ipfs.io', { recursive: true }).then(res => {
      // matches pattern /ipfs/<hash>
        expect(res).to.match(/\/ipfs\/.+$/)
      })
    })

    it('should resolve subdomain docs.ipfs.io', () => {
      return ipfs.dns('docs.ipfs.io').then(res => {
      // matches pattern /ipfs/<hash>
        expect(res).to.match(/\/ipfs\/.+$/)
      })
    })
  })
}
