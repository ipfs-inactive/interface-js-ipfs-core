/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const { getDescribe, getIt } = require('../utils/mocha')
const { expectIsBitswap } = require('./utils')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.bitswap', () => {
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

    it('should get bitswap stats', (done) => {
      ipfs.stats.bitswap((err, res) => {
        expectIsBitswap(err, res)
        done()
      })
    })

    it('should get bitswap stats (promised)', () => {
      return ipfs.stats.bitswap().then((res) => {
        expectIsBitswap(null, res)
      })
    })
  })
}
