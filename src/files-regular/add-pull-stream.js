/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const pull = require('pull-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.addPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should add pull stream of valid files and dirs', function () {
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

      const stream = ipfs.addPullStream()

      return new Promise((resolve) => {
        pull(
          pull.values(files),
          stream,
          pull.collect((err, filesAdded) => {
            expect(err).to.not.exist()

            filesAdded.forEach((file) => {
              if (file.path === 'test-folder') {
                expect(file.hash).to.equal(fixtures.directory.cid)
                resolve()
              }
            })
          })
        )
      })
    })

    it('should add with object chunks and pull stream content', () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return new Promise((resolve, reject) => {
        pull(
          pull.values([{ content: pull.values([Buffer.from('test')]) }]),
          ipfs.addPullStream(),
          pull.collect((err, res) => {
            if (err) return reject(err)
            expect(res).to.have.length(1)
            expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
            resolve()
          })
        )
      })
    })
  })
}
