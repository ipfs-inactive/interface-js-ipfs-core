/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const { expectIsBandwidth } = require('./utils')
const pull = require('pull-stream')
const { getDescribe, getIt } = require('../utils/mocha')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.bwPullStream', () => {
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

    it('should get bandwidth stats over pull stream', (done) => {
      const stream = ipfs.stats.bwPullStream()

      pull(
        stream,
        pull.collect((err, data) => {
          expectIsBandwidth(err, data[0])
          done()
        })
      )
    })
  })
}
