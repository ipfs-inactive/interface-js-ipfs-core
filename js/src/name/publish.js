/* eslint-env mocha */
'use strict'

const each = require('async/each')
const hat = require('hat')

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.publish', function () {
    this.timeout(50 * 1000)

    const keyName = hat()
    let ipfs
    let nodeId
    let keyId

    before(function (done) {
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          ipfs.id().then((res) => {
            expect(res.id).to.exist()

            nodeId = res.id

            ipfs.key.gen(keyName, { type: 'rsa', size: 2048 }, (err, key) => {
              expect(err).to.not.exist()
              expect(key).to.exist()
              expect(key).to.have.property('name', keyName)
              expect(key).to.have.property('id')

              keyId = key.id
              populate()
            })
          })
        })
      })

      function populate () {
        each(fixtures.files, (file, cb) => {
          ipfs.files.add(file.data, { pin: false }, cb)
        }, done)
      }
    })

    after((done) => common.teardown(done))

    it('name publish should publish correctly', (done) => {
      const value = fixtures.files[0].cid

      ipfs.name.publish(value, true, '1m', '10s', 'self', (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.equal(nodeId)

        done()
      })
    })

    it('name publish should publish correctly when the file was not added but resolve is disabled', (done) => {
      const value = 'QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

      ipfs.name.publish(value, false, '1m', '10s', 'self', (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.equal(nodeId)

        done()
      })
    })

    it('name publish should publish correctly when a new key is used', (done) => {
      const value = fixtures.files[0].cid

      ipfs.name.publish(value, false, '24h', '10s', keyName, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.equal(keyId)

        done()
      })
    })
  })
}
