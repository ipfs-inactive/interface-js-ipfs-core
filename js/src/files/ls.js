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

  describe('.files.ls', function () {
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

    it('should not ls not found, expect error', (done) => {
      ipfs.files.ls('/test/404', (err, info) => {
        expect(err).to.exist()
        expect(info).to.not.exist()
        done()
      })
    })

    it('should ls directory', (done) => {
      ipfs.files.ls('/test', (err, info) => {
        expect(err).to.not.exist()
        expect(info).to.eql([
          { name: 'b', type: 0, size: 0, hash: '' },
          { name: 'lv1', type: 0, size: 0, hash: '' }
        ])
        done()
      })
    })

    it('should ls -l directory', (done) => {
      ipfs.files.ls('/test', { l: true }, (err, info) => {
        expect(err).to.not.exist()
        expect(info).to.eql([
          {
            name: 'b',
            type: 0,
            size: 13,
            hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T'
          },
          {
            name: 'lv1',
            type: 1,
            size: 0,
            hash: 'QmaSPtNHYKPjNjQnYX9pdu5ocpKUQEL3itSz8LuZcoW6J5'
          }
        ])
        done()
      })
    })
  })
}
