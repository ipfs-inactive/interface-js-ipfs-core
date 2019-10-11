/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const timesSeries = require('async/timesSeries')
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

  describe('.key.list', () => {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should list all the keys', function (done) {
      this.timeout(60 * 1000)

      timesSeries(3, (n, cb) => {
        ipfs.key.gen(hat(), { type: 'rsa', size: 2048 }, cb)
      }, (err, keys) => {
        expect(err).to.not.exist()

        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.be.an('array')
          expect(res.length).to.be.above(keys.length - 1)

          keys.forEach(key => {
            const found = res.find(({ id, name }) => name === key.name && id === key.id)
            expect(found).to.exist()
          })

          done()
        })
      })
    })
  })
}
