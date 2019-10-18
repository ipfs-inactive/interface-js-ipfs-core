/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.lsReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not ls not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`

      const stream = ipfs.files.lsReadableStream(`${testDir}/404`)

      return new Promise((resolve) => {
        stream.once('error', (err) => {
          expect(err).to.exist()
          expect(err.message).to.include('does not exist')
          resolve()
        })
      })
    })

    it('should ls directory', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { p: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const stream = ipfs.files.lsReadableStream(testDir)
      const entries = []

      stream.on('data', entry => entries.push(entry))

      await new Promise((resolve) => {
        stream.once('end', () => {
          expect(entries.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
            { name: 'b', type: 0, size: 0, hash: '' },
            { name: 'lv1', type: 0, size: 0, hash: '' }
          ])
          resolve()
        })
      })
    })

    it('should ls directory with long option', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { p: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const stream = ipfs.files.lsReadableStream(testDir, { long: true })
      const entries = []

      stream.on('data', entry => entries.push(entry))

      await new Promise((resolve) => {
        stream.once('end', () => {
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
      })
    })
  })
}
