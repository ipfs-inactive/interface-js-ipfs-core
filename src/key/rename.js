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

    it('should rename a key', function (done) {
      this.timeout(30 * 1000)

      const oldName = hat()
      const newName = hat()

      ipfs.key.gen(oldName, { type: 'rsa', size: 2048 }, (err, key) => {
        expect(err).to.not.exist()

        ipfs.key.rename(oldName, newName, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.have.property('was', oldName)
          expect(res).to.have.property('now', newName)
          expect(res).to.have.property('id', key.id)

          ipfs.key.list((err, res) => {
            expect(err).to.not.exist()
            expect(res.find(k => k.name === newName)).to.exist()
            expect(res.find(k => k.name === oldName)).to.not.exist()
            done()
          })
        })
      })
    })
  })
}
