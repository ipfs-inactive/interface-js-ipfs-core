/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.mv', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should move file, expect error', (done) => {
      ipfs.files.mv(['/test/404', '/test/a'], (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should move file, expect no error', (done) => {
      ipfs.files.mv(['/test/a', '/test/c'], (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should move dir, expect error', (done) => {
      ipfs.files.mv(['/test/lv1/404', '/test/lv1'], (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should move dir, expect no error', (done) => {
      ipfs.files.mv(['/test/lv1/lv2', '/test/lv1/lv4'], (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })
}
