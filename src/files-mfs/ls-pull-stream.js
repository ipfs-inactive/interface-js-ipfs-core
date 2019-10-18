/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pull = require('pull-stream/pull')
const onEnd = require('pull-stream/sinks/on-end')
const collect = require('pull-stream/sinks/collect')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.lsPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not ls not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`

      return new Promise((resolve) => {
        pull(
          ipfs.files.lsPullStream(`${testDir}/404`),
          onEnd((err) => {
            expect(err).to.exist()
            expect(err.message).to.include('does not exist')
            resolve()
          })
        )
      })
    })

    it('should ls directory', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { p: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      await new Promise((resolve) => {
        pull(
          ipfs.files.lsPullStream(testDir),
          collect((err, entries) => {
            expect(err).to.not.exist()
            expect(entries.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
              { name: 'b', type: 0, size: 0, hash: '' },
              { name: 'lv1', type: 0, size: 0, hash: '' }
            ])
            resolve()
          })
        )
      })
    })

    it('should ls directory with long option', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { p: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      await new Promise((resolve) => {
        pull(
          ipfs.files.lsPullStream(testDir, { long: true }),
          collect((err, entries) => {
            expect(err).to.not.exist()
            expect(entries.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
              {
                name: 'b',
                type: 0,
                size: 13,
                hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T'
              },
              {
                name: 'lv1',
                type: 1,
                size: 0,
                hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
              }
            ])
            resolve()
          })
        )
      })
    })
  })
}
