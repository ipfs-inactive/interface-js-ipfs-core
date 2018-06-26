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

  describe('.id', () => {
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

    after((done) => {
      common.teardown(done)
    })

    it('should get the node ID', (done) => {
      ipfs.id((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.a.property('id')
        expect(res).to.have.a.property('publicKey')
        done()
      })
    })

    it('should get the node ID (promised)', () => {
      return ipfs.id()
        .then((res) => {
          expect(res).to.have.a.property('id')
          expect(res).to.have.a.property('publicKey')
        })
    })
  })
}
