/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.readPullStream', function () {
    this.timeout(40 * 1000)

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

    it('should not read not found, expect error', (done) => {
      const testDir = `/test-${hat()}`

      pull(
        ipfs.files.readPullStream(`${testDir}/404`),
        collect((err) => {
          expect(err).to.exist()
          expect(err.message).to.contain('does not exist')
          done()
        })
      )
    })

    it('should read file', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, cb),
        (cb) => ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        pull(
          ipfs.files.readPullStream(`${testDir}/a`),
          collect((err, bufs) => {
            expect(err).to.not.exist()
            expect(bufs).to.eql([Buffer.from('Hello, world!')])
            done()
          })
        )
      })
    })
  })
}
