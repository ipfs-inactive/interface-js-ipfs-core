/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  const invalidArg = 'this/Is/So/Invalid/'

  describe('.bootstrap.rm', function () {
    this.timeout(100 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should return an error when called with an invalid arg', (done) => {
      ipfs.bootstrap.rm(invalidArg, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('should return an empty list because no peers removed when called without an arg or options', (done) => {
      ipfs.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist()
        const peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('should return a list containing the peer removed when called with a valid arg (ip4)', (done) => {
      ipfs.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist()
        const peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('should return a list of all peers removed when all option is passed', (done) => {
      ipfs.bootstrap.rm(null, { all: true }, (err, res) => {
        expect(err).to.not.exist()
        const peers = res.Peers
        expect(peers).to.exist()
        done()
      })
    })
  })
}
