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

  describe('.getPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    before(() => ipfs.add(fixtures.smallFile.data))

    after(() => common.teardown())

    it('should return a Pull Stream of Pull Streams', () => {
      const stream = ipfs.getPullStream(fixtures.smallFile.cid)

      return new Promise((resolve) => {
        pull(
          stream,
          pull.collect((err, files) => {
            expect(err).to.not.exist()
            expect(files).to.be.length(1)
            expect(files[0].path).to.eql(fixtures.smallFile.cid)
            pull(
              files[0].content,
              pull.concat((err, data) => {
                expect(err).to.not.exist()
                expect(data.toString()).to.contain('Plz add me!')
                resolve()
              })
            )
          })
        )
      })
    })
  })
}
