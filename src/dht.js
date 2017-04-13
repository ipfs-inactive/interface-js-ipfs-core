/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const waterfall = require('async/waterfall')
const times = require('async/times')
const map = require('async/map')
const multihashing = require('multihashing-async')
const CID = require('cids')
const PeerId = require('peer-id')

module.exports = (common) => {
  describe.skip('.dht', () => {
    let nodeA
    let nodeB
    let nodeC
    let others

    before((done) => {
      common.setup((err, factory) => {
        expect(err).to.not.exist()
        times(3, (cb, i) => factory.spawnNode(cb), (err, nodes) => {
          expect(err).to.not.exist()

          nodeA = nodes[0]
          nodeB = nodes[1]
          nodeC = nodes[2]
          // Why isn't there a step to connect these ??!
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    describe('callback API', () => {
      describe('.get and .put', () => {
        it('errors when getting a non-existent key from the DHT', (done) => {
          nodeA.dht.get('non-existing', { timeout: '100ms' }, (err, value) => {
            expect(err).to.be.an.instanceof(Error)
            done()
          })
        })

        it('fetches value after it was put on another node', (done) => {
          const val = new Buffer('hello')

          waterfall([
            (cb) => multihashing(val, 'sha2-256', cb),
            (digest, cb) => {
              const cid = new CID(digest)

              waterfall([
                (cb) => nodeB.dht.put(cid, val, cb),
                (cb) => nodeA.dht.get(cid, cb),
                (res, cb) => {
                  expect(res).to.eql(val)
                  cb()
                }
              ], cb)
            }
          ], done)
        })
      })

      // This have been long time skipped ??!
      describe.skip('.findpeer', () => {
        it('finds other peers', (done) => {
          nodeA.dht.findpeer(peers.b.peerID, (err, foundPeer) => {
            expect(err).to.be.empty()
            expect(foundPeer.peerID).to.be.equal(peers.b.peerID)
            done()
          })
        })

        it('fails to find other peer, if peer doesnt exist()s', (done) => {
          nodeA.dht.findpeer('ARandomPeerID', (err, foundPeer) => {
            expect(err).to.be.instanceof(Error)
            expect(foundPeer).to.be.equal(null)
            done()
          })
        })
      })

      describe('findprovs', () => {
        it('basic', (done) => {
          const val = new Buffer('hello findprovs')

          waterfall([
            (cb) => multihashing(val, 'sha2-256', cb),
            (digest, cb) => {
              const cid = new CID(digest)

              waterfall([
                (cb) => nodeB.dht.provide(cid, cb),
                (cb) => nodeA.dht.findprovs(cid, cb),
                (provs, cb) => {
                  expect(provs.map((p) => p.toB58String()))
                    .to.eql([nodeB.id().id])
                  cb()
                }
              ], cb)
            }
          ], done)
        })
      })

      describe.skip('.query', () => {
        let ids

        before((done) => {
          times(2, (i, cb) => {
            map(others, (other, cb) => {
              other.id(cb)
            }, (err, res) => {
              expect(err).to.not.exist()
              ids = res
              nodeC.swarm.connect(ids[i].addresses[0], cb)
            })
          }, done)
        })

        it('returns the other node', (done) => {
          nodeA.dht.query(new PeerId(ids[1].id), (err, peers) => {
            expect(err).to.not.exist()
            expect(
              peers.map((p) => p.toB58String())
            ).to.include(ids[2].id)

            done()
          })
        })
      })

      describe('.provide', () => {
        it('regular', (done) => {
          const val = new Buffer('hello large file')

          waterfall([
            (cb) => multihashing(val, 'sha2-256', cb),
            (digest, cb) => {
              const cid = new CID(digest)

              nodeC.dht.provide(cid, cb)
            }
          ], done)
        })

        it.skip('recursive', () => {})
      })
    })

    describe('promise API', () => {
      describe('.get', () => {
        it('errors when getting a non-existent key from the DHT', (done) => {
          nodeA.dht.get('non-existing', {timeout: '100ms'}).catch((err) => {
            expect(err).to.be.an.instanceof(Error)
            done()
          })
        })
      })

      it('.findprovs', (done) => {
        nodeB.dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP').then((res) => {
          expect(res).to.be.an('array')
          done()
        }).catch(done)
      })
    })
  })
}
