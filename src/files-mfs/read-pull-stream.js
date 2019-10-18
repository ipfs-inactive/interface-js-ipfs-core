/* eslint-env mocha */
'use strict'

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

    it('should not read not found, expect error', () => {
      const testDir = `/test-${hat()}`

      return new Promise((resolve) => {
        pull(
          ipfs.files.readPullStream(`${testDir}/404`),
          collect((err) => {
            expect(err).to.exist()
            expect(err.message).to.contain('does not exist')
            resolve()
          })
        )
      })
    })

    it('should read file', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir)
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      await new Promise((resolve, reject) => {
        pull(
          ipfs.files.readPullStream(`${testDir}/a`),
          collect((err, bufs) => {
            expect(err).to.not.exist()
            expect(bufs).to.eql([Buffer.from('Hello, world!')])
            resolve()
          })
        )
      })
    })
  })
}
