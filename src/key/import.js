/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.import', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should import an exported key', async () => {
      const password = hat()

      const pem = await ipfs.key.export('self', password)
      expect(pem).to.exist()

      const key = await ipfs.key.import('clone', pem, password)
      expect(key).to.exist()
      expect(key).to.have.property('name', 'clone')
      expect(key).to.have.property('id')
    })
  })
}
