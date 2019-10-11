/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.readPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

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
