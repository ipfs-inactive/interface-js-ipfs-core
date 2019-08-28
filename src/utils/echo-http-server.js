/* eslint-env browser */
'use strict'

const http = require('http')
const https = require('https')
const URL = require('url').URL || self.URL
const { isNode } = require('ipfs-utils/src/env')

const loadFixture = require('aegir/fixtures')
const sslOpts = Object.freeze({
  key: loadFixture('test/fixtures/ssl/privkey.pem', 'interface-ipfs-core'),
  cert: loadFixture('test/fixtures/ssl/cert.pem', 'interface-ipfs-core')
})

const httpPort = 11080
const httpsPort = 11443

// Create a mock of remote HTTP server that can return arbitrary text in response
// or redirect to other URL. Used in tests of ipfs.addFromURL etc
module.exports.createServer = (opts) => {
  const secure = opts && opts.secure
  const defaultPort = secure ? httpsPort : httpPort

  // Web browser is not able to start HTTP server
  // We return noop here and start it from Node via .aegir.js/hooks/browser/pre|post instead (eg. in js-ipfs)
  if (!isNode) {
    const noopServer = {
      start: (cb) => cb(),
      stop: (cb) => cb(),
      url: () => `${secure ? 'https' : 'http'}://127.0.0.1:${defaultPort}`,
      echoUrl: (text) => `${noopServer.url()}/echo/${encodeURIComponent(text)}`,
      redirectUrl: (url) => `${noopServer.url()}/302/${encodeURI(url)}`
    }
    return Object.freeze(noopServer)
  }

  const handler = (req, res) => {
    // Relaxed CORS to enable use in tests in web browser with fetch
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, DELETE')
    res.setHeader('Access-Control-Allow-Headers', '*')
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
    // get the path without query or hash
    const { pathname } = new URL(`https://127.0.0.1${req.url}`)
    if (pathname.startsWith('/echo/')) {
      // Respond with text passed in URL after /echo/
      const [, text] = pathname.split('/echo/')
      res.setHeader('Content-Type', 'text/plain')
      res.write(decodeURIComponent(text))
    } else if (req.url.startsWith('/302/')) {
      // Return a redirect to a passed URL
      const [, location] = pathname.split('/302/')
      const url = decodeURI(location)
      res.statusCode = 302
      res.setHeader('Location', url)
    } else {
      res.statusCode = 500
    }
    res.end()
  }

  const server = secure
    ? https.createServer(sslOpts, handler)
    : http.createServer(handler)

  server.start = (opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }
    return server.listen(Object.assign({ port: defaultPort, host: '127.0.0.1' }, opts), cb)
  }

  server.stop = (cb) => server.close(cb)

  server.url = () => `${secure ? 'https' : 'http'}://127.0.0.1:${server.address().port}`
  server.echoUrl = (text) => `${server.url()}/echo/${encodeURIComponent(text)}`
  server.redirectUrl = (url) => `${server.url()}/302/${encodeURI(url)}`

  return server
}
