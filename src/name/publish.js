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

  describe('.name.publish offline', function () {
    const keyName = hat()
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

          ipfs.add(fixture.data, { pin: false }, done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should publish an IPNS record with the default params', async function () {
      this.timeout(50 * 1000)

      const value = fixture.cid

      const res = await ipfs.name.publish(value, { 'allow-offline': true })
      expect(res).to.exist()
      expect(res.name).to.equal(nodeId)
      expect(res.value).to.equal(`/ipfs/${value}`)
    })

    it('should publish correctly with the lifetime option and resolve', async () => {
      const [{ path }] = await ipfs.add(Buffer.from('should publish correctly with the lifetime option and resolve'))
      await ipfs.name.publish(path, { 'allow-offline': true, resolve: false, lifetime: '2h' })

      return expect(await ipfs.name.resolve(`/ipns/${nodeId}`)).to.eq(`/ipfs/${path}`)
    })

    it('should publish correctly when the file was not added but resolve is disabled', async function () {
      this.timeout(50 * 1000)

      const value = 'QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

      const options = {
        resolve: false,
        lifetime: '1m',
        ttl: '10s',
        key: 'self',
        'allow-offline': true
      }

      const res = await ipfs.name.publish(value, options)
      expect(res).to.exist()
      expect(res.name).to.equal(nodeId)
      expect(res.value).to.equal(`/ipfs/${value}`)
    })

    it('should publish with a key received as param, instead of using the key of the node', async function () {
      this.timeout(90 * 1000)

      const value = fixture.cid
      const options = {
        resolve: false,
        lifetime: '24h',
        ttl: '10s',
        key: keyName,
        'allow-offline': true
      }

      const key = await ipfs.key.gen(keyName, { type: 'rsa', size: 2048 })

      const res = await ipfs.name.publish(value, options)
      expect(res).to.exist()
      expect(res.name).to.equal(key.id)
      expect(res.value).to.equal(`/ipfs/${value}`)
    })
  })
}
