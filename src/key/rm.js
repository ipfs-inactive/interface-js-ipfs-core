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

  describe('.key.rm', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should rm a key', function (done) {
      this.timeout(30 * 1000)

      ipfs.key.gen(hat(), { type: 'rsa', size: 2048 }, (err, key) => {
        expect(err).to.not.exist()

        ipfs.key.rm(key.name, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.have.property('name', key.name)
          expect(res).to.have.property('id', key.id)

          ipfs.key.list((err, res) => {
            expect(err).to.not.exist()
            expect(res.find(k => k.name === key.name)).to.not.exist()
            done()
          })
        })
      })
    })
  })
}
