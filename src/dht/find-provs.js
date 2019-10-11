/* eslint-env mocha */
'use strict'

const multihashing = require('multihashing-async')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

function fakeCid (cb) {
  const bytes = Buffer.from(`TEST${Date.now()}`)
  multihashing(bytes, 'sha2-256', (err, mh) => {
    if (err) {
      cb(err)
    }
    cb(null, new CID(0, 'dag-pb', mh))
  })
}

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.findProvs', function () {
    this.timeout(60 * 1000)
    let nodeA
    let nodeB
    let nodeC

    before(async () => {
      nodeA = await common.setup()
      nodeB = await common.setup()
      nodeC = await common.setup()
      await Promise.all([
        nodeB.swarm.connect(nodeA.peerId.addresses[0]),
        nodeC.swarm.connect(nodeB.peerId.addresses[0])
      ])
    })

    after(() => common.teardown())

    let providedCid
    before('add providers for the same cid', function (done) {
      parallel([
        (cb) => nodeB.object.new('unixfs-dir', cb),
        (cb) => nodeC.object.new('unixfs-dir', cb)
      ], (err, cids) => {
        if (err) return done(err)
        providedCid = cids[0]
        parallel([
          (cb) => nodeB.dht.provide(providedCid, cb),
          (cb) => nodeC.dht.provide(providedCid, cb)
        ], done)
      })
    })

    it('should be able to find providers', function (done) {
      waterfall([
        (cb) => nodeA.dht.findProvs(providedCid, cb),
        (provs, cb) => {
          const providerIds = provs.map((p) => p.id.toB58String())
          expect(providerIds).to.have.members([
            nodeB.peerId.id,
            nodeC.peerId.id
          ])
          cb()
        }
      ], done)
    })

    it('should take options to override timeout config', function (done) {
      const options = {
        timeout: 1
      }
      waterfall([
        (cb) => fakeCid(cb),
        (cidV0, cb) => nodeA.dht.findProvs(cidV0, options, (err) => {
          expect(err).to.exist()
          cb(null)
        })
      ], done)
    })
  })
}
