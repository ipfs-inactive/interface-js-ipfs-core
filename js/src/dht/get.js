/* eslint-env mocha */
'use strict'

const hat = require('hat')
const waterfall = require('async/waterfall')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.get', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()

          nodeA = nodes[0]
          nodeB = nodes[1]
          connect(nodeA, nodeB.peerId.addresses[0], done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should error when getting a non-existent key from the DHT', (done) => {
      nodeA.dht.get('non-existing', { timeout: '100ms' }, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('should get a value after it was added on another node', function (done) {
      this.timeout(80 * 1000)

      waterfall([
        (cb) => nodeB.object.put(Buffer.from(hat()), cb),
        (dagNode, cb) => setTimeout(() => cb(null, dagNode), 20000),
        (dagNode, cb) => {
          const hash = dagNode.toJSON().hash

          nodeA.object.get(hash, cb)
        },
        (result, cb) => {
          expect(result).to.exist()
          cb()
        }
      ], done)
    })

    it('should get a value after it was put on another node', function (done) {
      this.timeout(80 * 1000)
      const multihash = Buffer.from('/v/hello')
      const data = Buffer.from('data')

      // Rewrite validators to simply validate the record
      nodeA._libp2pNode._dht.validators.v = nodeB._libp2pNode._dht.validators.v = {
        func (key, publicKey, callback) {
          setImmediate(callback)
        },
        sign: false
      }

      // Rewrite selectors to select first received record
      nodeA._libp2pNode._dht.selectors.v = () => 0

      waterfall([
        (cb) => nodeB.dht.put(multihash, data, cb),
        (cb) => nodeA.dht.get(multihash, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.eql(data)
          cb()
        })
      ], done)
    })
  })
}
