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

  describe('.name.resolve', function () {
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

    it('name resolve should resolve correctly after a publish', (done) => {
      this.timeout(60 * 1000)

      const value = fixtures.files[0].cid

      ipfs.name.publish(value, true, '1m', '10s', 'self', (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        ipfs.name.resolve(nodeId, false, false, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.equal(`/ipfs/${value}`)

          done()
        })
      })
    })

    it('name resolve should not get the entry correctly if its validity time expired', (done) => {
      this.timeout(60 * 1000)

      const value = fixtures.files[0].cid

      ipfs.name.publish(value, true, '10ns', '10s', 'self', (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        setTimeout(function () {
          ipfs.name.resolve(nodeId, false, false, (err, res) => {
            expect(err).to.exist()
            expect(res).to.not.exist()

            done()
          })
        }, 1)
      })
    })

    it('name resolve should should go recursively until finding an ipfs hash', (done) => {
      this.timeout(60 * 1000)

      const value = fixtures.files[0].cid

      ipfs.name.publish(value, true, '24h', '10s', 'self', (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        ipfs.name.publish(`/ipns/${nodeId}`, true, '24h', '10s', keyName, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()

          ipfs.name.resolve(keyId, false, true, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()
            expect(res).to.equal(`/ipfs/${value}`)

            done()
          })
        })
      })
    })
  })
}
