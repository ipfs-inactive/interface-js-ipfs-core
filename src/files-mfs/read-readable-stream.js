/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const bl = require('bl')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.readReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not read not found, expect error', () => {
      const testDir = `/test-${hat()}`

      const stream = ipfs.files.readReadableStream(`${testDir}/404`)
      stream.on('data', () => {})

      return new Promise((resolve) => {
        stream.once('error', (err) => {
          expect(err).to.exist()
          expect(err.message).to.contain('does not exist')
          resolve()
        })
      })
    })

    it('should read file', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir)
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      const stream = ipfs.files.readReadableStream(`${testDir}/a`)

      await new Promise((resolve, reject) => {
        stream.pipe(bl((err, buf) => {
          expect(err).to.not.exist()
          expect(buf).to.eql(Buffer.from('Hello, world!'))
          resolve()
        }))
      })
    })
  })
}
