/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')

const { fixture } = require('./utils')
const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.resolve offline', function () {
    const keyName = hat()
    let ipfs
    let nodeId
    let keyId

    before(function (done) {
      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          nodeId = node.peerId.id

          ipfs.add(fixture.data, { pin: false }, done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should resolve a record with the default params after a publish', function (done) {
      const value = fixture.cid

      ipfs.name.publish(value, { 'allow-offline': true }, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        ipfs.name.resolve(nodeId, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.equal(`/ipfs/${value}`)

          done()
        })
      })
    })

    it('should not get the entry if its validity time expired', function (done) {
      const publishOptions = {
        resolve: true,
        lifetime: '100ms',
        ttl: '10s',
        key: 'self',
        'allow-offline': true
      }

      ipfs.add(Buffer.from('should not get the entry if its validity time expired'), (err, r) => {
        expect(err).to.not.exist()
        ipfs.name.publish(r[0].path, publishOptions, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()

          // guarantee that the record has an expired validity.
          setTimeout(function () {
            ipfs.name.resolve(nodeId, (err, res) => {
              // go only has 1 possible error https://github.com/ipfs/go-ipfs/blob/master/namesys/interface.go#L51
              // so here we just expect an Error and don't match the error type to expiration
              expect(err).to.exist()

              done()
            })
          }, 500)
        })
      })
    })

    it('should recursively resolve to an IPFS hash', function (done) {
      const value = fixture.cid
      const publishOptions = {
        resolve: false,
        lifetime: '24h',
        ttl: '10s',
        key: 'self',
        'allow-offline': true
      }

      // Generate new key
      ipfs.key.gen(keyName, { type: 'rsa', size: 2048 }, (err, key) => {
        expect(err).to.not.exist()

        keyId = key.id

        // publish ipfs
        ipfs.name.publish(value, publishOptions, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()

          publishOptions.key = keyName

          // publish ipns with the generated key
          ipfs.name.publish(`/ipns/${nodeId}`, publishOptions, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.exist()

            const resolveOptions = {
              nocache: false,
              recursive: true
            }

            // recursive resolve (will get ipns first, and will resolve again to find the ipfs)
            ipfs.name.resolve(keyId, resolveOptions, (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.exist()
              expect(res).to.equal(`/ipfs/${value}`)

              done()
            })
          })
        })
      })
    })

    it('should resolve /ipns/<hash>/remainder/file.txt', async () => {
      const add = await ipfs.add(Buffer.from('fake remainder'))
      await ipfs.name.publish(add[0].path, { 'allow-offline': true })

      const resolve = await ipfs.name.resolve(`/ipns/${nodeId}/remainder/file.txt`)

      return expect(resolve).to.match(/\/ipfs\/.+\/remainder\/file.txt$/)
    })

    it('should resolve ipfs.io', async () => {
      const r = await ipfs.name.resolve('ipfs.io', { recursive: false })
      return expect(r).to.match(/\/ipns\/.+$/)
    })

    it('should resolve ipfs.io with remainder', async () => {
      const r = await ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg', { recursive: false })
      return expect(r).to.match(/\/ipns\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should resolve /ipns/ipfs.io recursive', async () => {
      const r = await ipfs.name.resolve('ipfs.io', { recursive: true })
      return expect(r).to.match(/\/ipfs\/.+$/)
    })

    it('should resolve /ipns/ipfs.io recursive with remainder', async () => {
      const r = await ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg', { recursive: true })
      return expect(r).to.match(/\/ipfs\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should fail to resolve /ipns/ipfs.a', async () => {
      return expect(ipfs.name.resolve('ipfs.a')).to.be.rejected()
    })
  })
}
