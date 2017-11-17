/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const Block = require('ipfs-block')
const multihash = require('multihashes')
const CID = require('cids')
const Buffer = require('safe-buffer').Buffer

function expectKey (block, expected, callback) {
  expect(block.cid.multihash).to.eql(expected)
  callback()
}

module.exports = (common) => {
  describe('.block', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(20 * 1000)

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

    describe('callback API', () => {
      describe('.put', () => {
        it('a buffer, using defaults', (done) => {
          const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const blob = new Buffer('blorb')

          ipfs.block.put(blob, (err, block) => {
            expect(err).to.not.exist()
            expect(block.data).to.be.eql(blob)
            expectKey(block, multihash.fromB58String(expectedHash), done)
          })
        })

        it('a buffer, using CID', (done) => {
          const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(expectedHash)
          const blob = new Buffer('blorb')

          ipfs.block.put(blob, { cid: cid }, (err, block) => {
            expect(err).to.not.exist()
            expect(block.data).to.be.eql(blob)
            expectKey(block, multihash.fromB58String(expectedHash), done)
          })
        })

        it('a buffer, using options', (done) => {
          const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const blob = new Buffer('blorb')

          ipfs.block.put(blob, {
            format: 'dag-pb',
            mhtype: 'sha2-256',
            version: 0
          }, (err, block) => {
            expect(err).to.not.exist()
            expect(block.data).to.be.eql(blob)
            expectKey(block, multihash.fromB58String(expectedHash), done)
          })
        })

        it('a Block instance', (done) => {
          const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(expectedHash)
          const b = new Block(new Buffer('blorb'), cid)

          ipfs.block.put(b, (err, block) => {
            expect(err).to.not.exist()
            expect(block.data).to.eql(new Buffer('blorb'))
            expectKey(block, multihash.fromB58String(expectedHash), done)
          })
        })

        it('error with array of blocks', (done) => {
          const blob = Buffer('blorb')

          ipfs.block.put([blob, blob], (err) => {
            expect(err).to.be.an.instanceof(Error)
            done()
          })
        })
      })

      describe('.get', () => {
        it('by CID object', (done) => {
          const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(hash)

          ipfs.block.get(cid, (err, block) => {
            expect(err).to.not.exist()
            expect(block.data).to.eql(new Buffer('blorb'))
            expectKey(block, cid.multihash, done)
          })
        })

        it('by CID in Str', (done) => {
          const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'

          ipfs.block.get(hash, (err, block) => {
            expect(err).to.not.exist()
            expect(block.data).to.eql(new Buffer('blorb'))
            expectKey(block, multihash.fromB58String(hash), done)
          })
        })
      })

      describe('.stat', () => {
        it('by CID', (done) => {
          const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(hash)

          ipfs.block.stat(cid, (err, stats) => {
            expect(err).to.not.exist()
            expect(stats).to.have.property('key')
            expect(stats).to.have.property('size')
            done()
          })
        })
      })

      describe('.rm', function () {
        it('by CID', (done) => {
          const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(expectedHash)
          const b = new Block(new Buffer('blorb'), cid)

          series([
            (cb) => {
              // Add a block
              ipfs.block.put(b, (err, block) => {
                expect(err).to.not.exist()
                expect(block.data).to.be.eql(b.data)
                expectKey(block, multihash.fromB58String(expectedHash), cb)
              })
            },
            (cb) => {
              // Remove the block
              ipfs.block.rm(cid, (err) => {
                expect(err).to.not.exist()
                cb()
              })
            },
            (cb) => {
              // Remove bitswap from IPFS so that block.get tries to fetch the block
              // from the local repo (not from the network). This is to make sure we
              // get the error (as expected) instead of waiting for a timeout.
              ipfs._blockService._bitswap = null
              // Verify that the block was removed
              ipfs.block.get(cid, (err, block) => {
                expect(err).to.exist()
                expect(block).to.not.exist()
                // Verifying the error message with a function due to chai
                // NOT supporting .to.include.any([str1, str2])
                expect(err.toString()).to.satisfy((str) => {
                  return str.indexOf('Error: ENOENT: no such file or directory') > -1 ||
                    str.indexOf('NotFoundError: Key not found in database') > -1
                })
                cb()
              })
            }
          ], done)
        })
      })
    })

    describe('promise API', () => {
      describe('.put', () => {
        it('a buffer, using defaults', (done) => {
          const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const blob = new Buffer('blorb')

          ipfs.block.put(blob)
            .then((block) => {
              expect(block.data).to.be.eql(blob)
              expectKey(block, multihash.fromB58String(expectedHash), done)
            })
            .catch(done)
        })
      })

      describe('.get', () => {
        it('by CID object', (done) => {
          const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(hash)

          ipfs.block.get(cid)
            .then((block) => {
              expect(block.data).to.eql(new Buffer('blorb'))
              expectKey(block, cid.multihash, done)
            })
            .catch(done)
        })
      })

      describe('.stat', () => {
        it('by CID', (done) => {
          const hash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(hash)

          ipfs.block.stat(cid)
            .then((stats) => {
              expect(stats).to.have.property('key')
              expect(stats).to.have.property('size')
              done()
            })
            .catch(done)
        })
      })

      describe('.rm', function () {
        it('by CID', (done) => {
          const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
          const cid = new CID(expectedHash)
          const b = new Block(new Buffer('blorb'), cid)

          ipfs.block.put(b)
            .then((block) => {
              expect(block.data).to.be.eql(b.data)
            })
            .then(() => ipfs.block.rm(cid)) // Remove the block
            .then(() => {
              // Remove bitswap from IPFS so that block.get tries to fetch the block
              // from the local repo (not from the network). This is to make sure we
              // get the error (as expected) instead of waiting for a timeout.
              ipfs._blockService._bitswap = null
              // Verify that the block was removed
              return ipfs.block.get(cid)
            })
            .then((block) => {
              // We should never end here
              expect(block).to.not.exist()
              done(new Error('Block was not removed!'))
            })
            .catch((err) => {
              // Verifying the error message with a function due to chai
              // NOT supporting .to.include.any([str1, str2])
              expect(err.toString()).to.satisfy((str) => {
                return str.indexOf('Error: ENOENT: no such file or directory') > -1 ||
                  str.indexOf('NotFoundError: Key not found in database') > -1
              })
              done()
            })
        })
      })
    })
  })
}
