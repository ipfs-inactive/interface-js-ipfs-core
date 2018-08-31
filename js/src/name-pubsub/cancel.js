/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const loadFixture = require('aegir/fixtures')

const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

const fixture = Object.freeze({
  data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core'),
  cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
})

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

          ipfs.files.add(fixture.data, { pin: false }, done)
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
      this.timeout(140 * 1000)
      const value = fixture.cid

      ipfs.name.publish(value, { resolve: false }, (err, res) => {
        expect(err).to.not.exist()

        ipfs.name.resolve(nodeId, (err) => {
          expect(err).to.not.exist()

          ipfs.name.pubsub.cancel(nodeId, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()
            expect(res).to.have.property('canceled')
            expect(res.canceled).to.eql(true)

            done()
          })
        })
      })
    })
  })
}
