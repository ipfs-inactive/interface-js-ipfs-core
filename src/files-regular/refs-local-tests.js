/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {*} suiteName
 * @param {*} ipfsRefsLocal
 * @param {Object} options
 */
module.exports = (common, suiteName, ipfsRefsLocal, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe(suiteName, function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get local refs', function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt')
      ]

      ipfs.add(dirs, (err, res) => {
        expect(err).to.not.exist()

        ipfsRefsLocal(ipfs)((err, refs) => {
          expect(err).to.not.exist()

          const cids = refs.map(r => r.ref)
          expect(cids).to.include('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn')
          expect(cids).to.include('QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr')

          done()
        })
      })
    })
  })
}
