/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.set', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should set a new key', (done) => {
      ipfs.config.set('Fruit', 'banana', (err) => {
        expect(err).to.not.exist()
        ipfs.config.get('Fruit', (err, fruit) => {
          expect(err).to.not.exist()
          expect(fruit).to.equal('banana')
          done()
        })
      })
    })

    it('should set a new key (promised)', () => {
      return ipfs.config.set('Fruit', 'banana')
        .then(() => ipfs.config.get('Fruit'))
        .then((fruit) => {
          expect(fruit).to.equal('banana')
        })
    })

    it('should set an already existing key', (done) => {
      ipfs.config.set('Fruit', 'morango', (err) => {
        expect(err).to.not.exist()
        ipfs.config.get('Fruit', (err, fruit) => {
          expect(err).to.not.exist()
          expect(fruit).to.equal('morango')
          done()
        })
      })
    })

    it('should set a number', (done) => {
      const key = 'Discovery.MDNS.Interval'
      const val = 11
      ipfs.config.set(key, val, function (err) {
        expect(err).to.not.exist()
        ipfs.config.get(key, function (err, result) {
          expect(err).to.not.exist()
          expect(result).to.equal(val)
          done()
        })
      })
    })

    it('should set a boolean', async () => {
      const value = true
      const key = 'Discovery.MDNS.Enabled'

      await ipfs.config.set(key, value)
      expect(await ipfs.config.get(key)).to.equal(value)
    })

    it('should set the other boolean', async () => {
      const value = false
      const key = 'Discovery.MDNS.Enabled'

      await ipfs.config.set(key, value)
      expect(await ipfs.config.get(key)).to.equal(value)
    })

    it('should set a JSON object', (done) => {
      const key = 'API.HTTPHeaders.Access-Control-Allow-Origin'
      const val = ['http://example.io']
      ipfs.config.set(key, val, function (err) {
        expect(err).to.not.exist()
        ipfs.config.get(key, function (err, result) {
          expect(err).to.not.exist()
          expect(result).to.deep.equal(val)
          done()
        })
      })
    })

    it('should fail on non valid key', (done) => {
      ipfs.config.set(Buffer.from('heeey'), '', (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should fail on non valid value', (done) => {
      ipfs.config.set('Fruit', Buffer.from('abc'), (err) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
