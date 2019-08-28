/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const parallel = require('async/parallel')
const EchoHttpServer = require('../utils/echo-http-server')
const { isNode } = require('ipfs-utils/src/env')

const httpServer = EchoHttpServer.createServer()
const httpsServer = EchoHttpServer.createServer({ secure: true })

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromURL', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)
      // Instructs node to not reject our snake oil SSL certificate when it
      // can't verify the certificate authority
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
      parallel([
        cb => common.setup((err, factory) => {
          expect(err).to.not.exist()
          factory.spawnNode((err, node) => {
            expect(err).to.not.exist()
            ipfs = node
            cb()
          })
        }),
        cb => httpServer.start(cb),
        cb => httpsServer.start(cb)
      ], done)
    })

    after((done) => {
      // Reinstate unauthorised SSL cert rejection
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1
      parallel([
        cb => httpServer.stop(cb),
        cb => httpsServer.stop(cb),
        cb => common.teardown(cb)
      ], done)
    })

    it('should add from a HTTP URL', (done) => {
      const text = `TEST${Date.now()}`
      const url = httpServer.echoUrl(text)
      parallel({
        result: (cb) => ipfs.addFromURL(url, cb),
        expectedResult: (cb) => ipfs.add(Buffer.from(text), cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result[0].hash).to.equal(expectedResult[0].hash)
        expect(result[0].size).to.equal(expectedResult[0].size)
        expect(result[0].path).to.equal(text)
        done()
      })
    })

    it('should add from a HTTPS URL', function (done) {
      if (!isNode) return this.skip() // unable to do self-signed HTTPS in browser
      const text = `TEST${Date.now()}`
      const url = httpsServer.echoUrl(text)
      parallel({
        result: (cb) => ipfs.addFromURL(url, cb),
        expectedResult: (cb) => ipfs.add(Buffer.from(text), cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result[0].hash).to.equal(expectedResult[0].hash)
        expect(result[0].size).to.equal(expectedResult[0].size)
        expect(result[0].path).to.equal(text)
        done()
      })
    })

    it('should add from a HTTP URL with redirection', (done) => {
      const text = `TEST${Date.now()}`
      const url = httpServer.echoUrl(text) + '?foo=bar#buzz'
      const redirectUrl = httpServer.redirectUrl(url)

      parallel({
        result: (cb) => ipfs.addFromURL(redirectUrl, cb),
        expectedResult: (cb) => ipfs.add(Buffer.from(text), cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result[0].hash).to.equal(expectedResult[0].hash)
        expect(result[0].size).to.equal(expectedResult[0].size)
        expect(result[0].path).to.equal(text)
        done()
      })
    })

    it('should add from a HTTPS URL with redirection', function (done) {
      if (!isNode) return this.skip() // unable to do self-signed HTTPS in browser
      const text = `TEST${Date.now()}`
      const url = httpsServer.echoUrl(text) + '?foo=bar#buzz'
      const redirectUrl = httpsServer.redirectUrl(url)

      parallel({
        result: (cb) => ipfs.addFromURL(redirectUrl, cb),
        expectedResult: (cb) => ipfs.add(Buffer.from(text), cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result[0].hash).to.equal(expectedResult[0].hash)
        expect(result[0].size).to.equal(expectedResult[0].size)
        expect(result[0].path).to.equal(text)
        done()
      })
    })

    it('should add from a URL with only-hash=true', (done) => {
      const text = `TEST${Date.now()}`
      const url = httpServer.echoUrl(text)
      ipfs.addFromURL(url, { onlyHash: true }, (err, res) => {
        expect(err).to.not.exist()

        // A successful object.get for this size data took my laptop ~14ms
        let didTimeout = false
        const timeoutId = setTimeout(() => {
          didTimeout = true
          done()
        }, 500)

        ipfs.object.get(res[0].hash, () => {
          clearTimeout(timeoutId)
          if (didTimeout) return
          expect(new Error('did not timeout')).to.not.exist()
        })
      })
    })

    it('should add from a URL with wrap-with-directory=true', (done) => {
      const filename = `TEST${Date.now()}.txt` // also acts as data
      const url = httpServer.echoUrl(filename) + '?foo=bar#buzz'
      const addOpts = { wrapWithDirectory: true }
      parallel({
        result: (cb) => ipfs.addFromURL(url, addOpts, cb),
        expectedResult: (cb) => ipfs.add([{ path: filename, content: Buffer.from(filename) }], addOpts, cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result).to.deep.equal(expectedResult)
        done()
      })
    })

    it('should add from a URL with wrap-with-directory=true and URL-escaped file name', (done) => {
      const filename = `320px-Domažlice,_Jiráskova_43_(${Date.now()}).jpg` // also acts as data
      const url = httpServer.echoUrl(filename) + '?foo=bar#buzz'
      const addOpts = { wrapWithDirectory: true }
      parallel({
        result: (cb) => ipfs.addFromURL(url, addOpts, cb),
        expectedResult: (cb) => ipfs.add([{ path: filename, content: Buffer.from(filename) }], addOpts, cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result).to.deep.equal(expectedResult)
        done()
      })
    })

    it('should not add from an invalid url', (done) => {
      ipfs.addFromURL('http://invalid', (err, result) => {
        expect(err).to.exist()
        expect(result).to.not.exist()
        done()
      })
    })
  })
}
