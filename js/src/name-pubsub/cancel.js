/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const series = require('async/series')

const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.pubsub.cancel', function () {
    let ipfs
    let nodeId

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          nodeId = node.peerId.id

          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should return false when the name that is intended to cancel is not subscribed', function (done) {
      this.timeout(60 * 1000)

      ipfs.name.pubsub.cancel(nodeId, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.property('canceled')
        expect(res.canceled).to.eql(false)

        done()
      })
    })

    it('should cancel a subscription correctly returning true', function (done) {
      this.timeout(300 * 1000)
      const id = 'QmNP1ASen5ZREtiJTtVD3jhMKhoPb1zppET1tgpjHx2NGA'
      const ipnsPath = `/ipns/${id}`

      ipfs.name.pubsub.subs((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.eql([]) // initally empty

        ipfs.name.resolve(id, (err) => {
          expect(err).to.exist()
          series([
            (cb) => ipfs.name.pubsub.subs(cb),
            (cb) => ipfs.name.pubsub.cancel(ipnsPath, cb),
            (cb) => ipfs.name.pubsub.subs(cb)
          ], (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()
            expect(res[0]).to.be.an('array').that.does.include(ipnsPath)
            expect(res[1]).to.have.property('canceled')
            expect(res[1].canceled).to.eql(true)
            expect(res[2]).to.be.an('array').that.does.not.include(ipnsPath)

            done()
          })
        })
      })
    })
  })
}
