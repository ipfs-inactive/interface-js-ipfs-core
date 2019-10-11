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

  describe('.pin.rm', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = await common.setup()
      await ipfs.add(fixtures.files[0].data, { pin: false })
      await ipfs.pin.add(fixtures.files[0].cid, { recursive: true })
      await ipfs.add(fixtures.files[1].data, { pin: false })
      await ipfs.pin.add(fixtures.files[1].cid, { recursive: false })
    })

    after(() => common.teardown())

    it('should remove a recursive pin', (done) => {
      ipfs.pin.rm(fixtures.files[0].cid, { recursive: true }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.equal([{
          hash: fixtures.files[0].cid
        }])
        ipfs.pin.ls({ type: 'recursive' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.deep.include({
            hash: fixtures.files[0].cid,
            type: 'recursive'
          })
          done()
        })
      })
    })

    it('should remove a direct pin (promised)', () => {
      return ipfs.pin.rm(fixtures.files[1].cid, { recursive: false })
        .then((pinset) => {
          expect(pinset).to.deep.equal([{
            hash: fixtures.files[1].cid
          }])
          return ipfs.pin.ls({ type: 'direct' })
        })
        .then((pinset) => {
          expect(pinset).to.not.deep.include({
            hash: fixtures.files[1].cid
          })
        })
    })
  })
}
