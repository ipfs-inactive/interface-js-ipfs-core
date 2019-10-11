/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

const invalidArg = 'this/Is/So/Invalid/'
const validIp4 = '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bootstrap.add', function () {
    this.timeout(100 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should return an error when called with an invalid arg', (done) => {
      ipfs.bootstrap.add(invalidArg, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('should return a list containing the bootstrap peer when called with a valid arg (ip4)', (done) => {
      ipfs.bootstrap.add(validIp4, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.eql({ Peers: [validIp4] })
        const peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(1)
        done()
      })
    })

    it('should return a list of bootstrap peers when called with the default option', (done) => {
      ipfs.bootstrap.add(null, { default: true }, (err, res) => {
        expect(err).to.not.exist()
        const peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.above(1)
        done()
      })
    })

    it('should prevent duplicate inserts of bootstrap peers', async () => {
      await ipfs.bootstrap.rm(null, { all: true })

      const added = await ipfs.bootstrap.add(validIp4)
      expect(added).to.have.property('Peers').that.deep.equals([validIp4])

      const addedAgain = await ipfs.bootstrap.add(validIp4)
      expect(addedAgain).to.have.property('Peers').that.deep.equals([validIp4])

      const list = await ipfs.bootstrap.list()
      expect(list).to.have.property('Peers').that.deep.equals([validIp4])
    })
  })
}
