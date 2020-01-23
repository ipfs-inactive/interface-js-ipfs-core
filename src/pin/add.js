/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.add', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api
      await Promise.all(fixtures.files.map(file => {
        return all(ipfs.add(file.data, { pin: false }))
      }))
    })

    after(() => common.clean())

    it('should add a pin', async () => {
      const pinset = await ipfs.pin.add(fixtures.files[0].cid, { recursive: false })
      expect(pinset.map(p => p.cid.toString())).to.include(fixtures.files[0].cid)
    })
  })
}
