/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.read', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should not read not found, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.read(`${testDir}/404`, (err) => {
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

        ipfs.files.read(`${testDir}/a`, (err, buf) => {
          expect(err).to.not.exist()
          expect(buf).to.eql(Buffer.from('Hello, world!'))
          done()
        })
      })
    })

    it('should read from outside of mfs', async () => {
      const [{
        hash
      }] = await ipfs.add(fixtures.smallFile.data)
      const testFileData = await ipfs.files.read(`/ipfs/${hash}`)
      expect(testFileData).to.eql(fixtures.smallFile.data)
    })
  })
}
