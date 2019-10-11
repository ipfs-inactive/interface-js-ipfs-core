/* eslint-env mocha */
'use strict'

const series = require('async/series')
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

    it('should not read not found, expect error', (done) => {
      const testDir = `/test-${hat()}`

      const stream = ipfs.files.readReadableStream(`${testDir}/404`)
      stream.on('data', () => {})

      stream.once('error', (err) => {
        expect(err).to.exist()
        expect(err.message).to.contain('does not exist')
        done()
      })
    })

    it('should read file', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, cb),
        (cb) => ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        const stream = ipfs.files.readReadableStream(`${testDir}/a`)

        stream.pipe(bl((err, buf) => {
          expect(err).to.not.exist()
          expect(buf).to.eql(Buffer.from('Hello, world!'))
          done()
        }))
      })
    })
  })
}
