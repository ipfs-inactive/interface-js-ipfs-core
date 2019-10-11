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

  describe('.key.gen', () => {
    const keyTypes = [
      { type: 'rsa', size: 2048 }
    ]

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    keyTypes.forEach((kt) => {
      it(`should generate a new ${kt.type} key`, function (done) {
        this.timeout(20 * 1000)
        const name = hat()
        ipfs.key.gen(name, kt, (err, key) => {
          expect(err).to.not.exist()
          expect(key).to.exist()
          expect(key).to.have.property('name', name)
          expect(key).to.have.property('id')
          done()
        })
      })
    })
  })
}
