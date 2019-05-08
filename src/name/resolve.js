/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const delay = require('../utils/delay')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.resolve offline', function () {
    const common = createCommon()
    let ipfs
    let nodeId

    before(function (done) {
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

    // This test should be changed to the recursive logic when recursive === true is the default
    it('should resolve a record default options', async () => {
      const [{ path }] = await ipfs.add(Buffer.from('should resolve a record default options'))
      await ipfs.name.publish(path, { 'allow-offline': true })
      return expect(ipfs.name.resolve(`/ipns/${nodeId}`))
        .to.become(`/ipfs/${path}`)
    })

    it('should resolve a record recursive === false', async () => {
      const [{ path }] = await ipfs.add(Buffer.from('should resolve a record recursive === false'))
      await ipfs.name.publish(path, { 'allow-offline': true })
      return expect(ipfs.name.resolve(`/ipns/${nodeId}`, { recursive: false }))
        .to.become(`/ipfs/${path}`)
    })

    it('should resolve a record recursive === true', async () => {
      const [{ path }] = await ipfs.add(Buffer.from('should resolve a record recursive === true'))

      const { id: keyId } = await ipfs.key.gen('key-name', { type: 'rsa', size: 2048 })

      await ipfs.name.publish(path, { 'allow-offline': true })
      await ipfs.name.publish(`/ipns/${nodeId}`, { 'allow-offline': true, key: 'key-name' })

      return expect(ipfs.name.resolve(`/ipns/${keyId}`, { recursive: true }))
        .to.become(`/ipfs/${path}`)
    })

    // This test should be changed to the recursive logic when recursive === true is the default
    it('should resolve a record default options with remainder', async () => {
      const [{ path }] = await ipfs.add(Buffer.from('should resolve a record with the default params with remainder'))
      await ipfs.name.publish(path, { 'allow-offline': true })
      return expect(ipfs.name.resolve(`/ipns/${nodeId}/remainder/file.txt`))
        .to.become(`/ipfs/${path}/remainder/file.txt`)
    })

    it('should resolve a record recursive === false with remainder', async () => {
      const [{ path }] = await ipfs.add(Buffer.from('should resolve a record recursive = false with remainder'))
      await ipfs.name.publish(path, { 'allow-offline': true })
      return expect(ipfs.name.resolve(`/ipns/${nodeId}/remainder/file.txt`, { recursive: false }))
        .to.become(`/ipfs/${path}/remainder/file.txt`)
    })

    it('should resolve a record recursive === true with remainder', async () => {
      const [{ path }] = await ipfs.add(Buffer.from('should resolve a record recursive = true with remainder'))

      const { id: keyId } = await ipfs.key.gen('key-name-remainder', { type: 'rsa', size: 2048 })

      await ipfs.name.publish(path, { 'allow-offline': true })
      await ipfs.name.publish(`/ipns/${nodeId}`, { 'allow-offline': true, key: 'key-name-remainder' })

      return expect(ipfs.name.resolve(`/ipns/${keyId}/remainder/file.txt`, { recursive: true }))
        .to.be.eventually.equal(`/ipfs/${path}/remainder/file.txt`)
    })

    it('should not get the entry if its validity time expired', async () => {
      const publishOptions = {
        lifetime: '100ms',
        ttl: '10s',
        'allow-offline': true
      }

      // we add new data instead of re-using fixture to make sure lifetime handling doesn't break
      const [{ path }] = await ipfs.add(Buffer.from('should not get the entry if its validity time expired'))
      await ipfs.name.publish(path, publishOptions)
      await delay(500)
      // go only has 1 possible error https://github.com/ipfs/go-ipfs/blob/master/namesys/interface.go#L51
      // so here we just expect an Error and don't match the error type to expiration
      return expect(ipfs.name.resolve(nodeId)).to.be.rejected()
    })
  })

  describe('.name.resolve dns', function () {
    const common = createCommon()
    let ipfs
    this.retries(3)

    before(function (done) {
      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    // This test should be changed to the recursive logic when recursive === true is the default
    it('should resolve /ipns/ipfs.io', async () => {
      return expect(ipfs.name.resolve('/ipns/ipfs.io'))
        .to.eventually.match(/\/ipns\/.+$/)
    })

    it('should resolve /ipns/ipfs.io recursive === false', async () => {
      return expect(ipfs.name.resolve('/ipns/ipfs.io', { recursive: false }))
        .to.eventually.match(/\/ipns\/.+$/)
    })

    it('should resolve /ipns/ipfs.io recursive === true', async () => {
      return expect(ipfs.name.resolve('/ipns/ipfs.io', { recursive: true }))
        .to.eventually.match(/\/ipfs\/.+$/)
    })

    // This test should be changed to the recursive logic when recursive === true is the default
    it('should resolve /ipns/ipfs.io with remainder', async () => {
      return expect(ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg'))
        .to.eventually.match(/\/ipns\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should resolve /ipns/ipfs.io with remainder recursive === false', async () => {
      return expect(ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg', { recursive: false }))
        .to.eventually.match(/\/ipns\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should resolve /ipns/ipfs.io with remainder  recursive === true', async () => {
      return expect(ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg', { recursive: true }))
        .to.eventually.match(/\/ipfs\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should fail to resolve /ipns/ipfs.a', async () => {
      return expect(ipfs.name.resolve('ipfs.a')).to.be.rejected()
    })

    it('should resolve ipns path with hamt-shard recursive === true', async () => {
      return expect(ipfs.name.resolve('/ipns/tr.wikipedia-on-ipfs.org/wiki/Anasayfa.html', { recursive: true }))
        .to.eventually.match(/\/ipfs\/.+$/)
    })
  })
}
