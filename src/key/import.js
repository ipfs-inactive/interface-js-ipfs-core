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

    it('should import an exported key', (done) => {
      const password = hat()

      ipfs.key.export('self', password, (err, pem) => {
        expect(err).to.not.exist()
        expect(pem).to.exist()

        ipfs.key.import('clone', pem, password, (err, key) => {
          expect(err).to.not.exist()
          expect(key).to.exist()
          expect(key).to.have.property('name', 'clone')
          expect(key).to.have.property('id')
          done()
        })
      })
    })
  })
}
