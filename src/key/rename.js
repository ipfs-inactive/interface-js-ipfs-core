/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
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

  describe('.key.rename', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should rename a key', async function () {
      this.timeout(30 * 1000)

      const oldName = hat()
      const newName = hat()

      const key = await ipfs.key.gen(oldName, { type: 'rsa', size: 2048 })

      const renameRes = await ipfs.key.rename(oldName, newName)
      expect(renameRes).to.exist()
      expect(renameRes).to.have.property('was', oldName)
      expect(renameRes).to.have.property('now', newName)
      expect(renameRes).to.have.property('id', key.id)

      const res = await ipfs.key.list()
      expect(res.find(k => k.name === newName)).to.exist()
      expect(res.find(k => k.name === oldName)).to.not.exist()
    })
  })
}
