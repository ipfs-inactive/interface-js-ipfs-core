/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.add', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = await common.setup()
      await Promise.all(fixtures.files.map(file => {
        return ipfs.add(file.data, { pin: false })
      }))
    })

    after(() => common.teardown())

    it('should add a pin', (done) => {
      ipfs.pin.add(fixtures.files[0].cid, { recursive: false }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.include({
          hash: fixtures.files[0].cid
        })
        done()
      })
    })

    it('should add a pin (promised)', () => {
      return ipfs.pin.add(fixtures.files[1].cid, { recursive: false })
        .then((pinset) => {
          expect(pinset).to.deep.include({
            hash: fixtures.files[1].cid
          })
        })
    })
  })
}
