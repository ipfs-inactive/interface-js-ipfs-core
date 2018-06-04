/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const { getDescribe } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const common = createCommon()

  describe('.config.replace', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

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
