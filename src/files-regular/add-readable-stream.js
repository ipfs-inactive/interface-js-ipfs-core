/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.addReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should add readable stream of valid files and dirs', function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const files = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const stream = ipfs.addReadableStream()

      stream.on('error', (err) => {
        expect(err).to.not.exist()
      })

      stream.on('data', (file) => {
        if (file.path === 'test-folder') {
          expect(file.hash).to.equal(fixtures.directory.cid)
        }
      })

      return new Promise((resolve, reject) => {
        stream.on('end', resolve)

        files.forEach((file) => stream.write(file))
        stream.end()
      })
    })
  })
}
