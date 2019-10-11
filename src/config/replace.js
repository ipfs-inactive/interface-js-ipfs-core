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

  describe('.config.replace', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    const config = {
      Fruit: 'Bananas'
    }

    it('should replace the whole config', (done) => {
      ipfs.config.replace(config, (err) => {
        expect(err).to.not.exist()
        ipfs.config.get((err, _config) => {
          expect(err).to.not.exist()
          expect(_config).to.deep.equal(config)
          done()
        })
      })
    })

    it('should replace to empty config', (done) => {
      ipfs.config.replace({}, (err) => {
        expect(err).to.not.exist()
        ipfs.config.get((err, _config) => {
          expect(err).to.not.exist()
          expect(_config).to.deep.equal({})
          done()
        })
      })
    })
  })
}
