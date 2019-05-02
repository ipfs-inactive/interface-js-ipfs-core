'use strict'

const loadFixture = require('aegir/fixtures')

exports.fixtures = Object.freeze({
  directory: Object.freeze({
    cid: 'bafybeiaqxngbqbr5erl2ux2rfuoipy3b6caefjodi3gshpi3u7nsqruvuq',
    files: Object.freeze({
      'pp.txt': loadFixture('test/fixtures/test-folder/pp.txt', 'interface-ipfs-core'),
      'holmes.txt': loadFixture('test/fixtures/test-folder/holmes.txt', 'interface-ipfs-core'),
      'jungle.txt': loadFixture('test/fixtures/test-folder/jungle.txt', 'interface-ipfs-core'),
      'alice.txt': loadFixture('test/fixtures/test-folder/alice.txt', 'interface-ipfs-core'),
      'files/hello.txt': loadFixture('test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
      'files/ipfs.txt': loadFixture('test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core')
    })
  }),
  smallFile: Object.freeze({
    cid: 'bafkreidffqfydlguosmmyebv5rp72m45tbpbq6segnkosa45kjfnduix6u',
    data: loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core')
  }),
  bigFile: Object.freeze({
    cid: 'bafybeih2sk5etf4biw7mcmzximj4zz5yite4lhqowiq2pfdwiz55qgsiqu',
    data: loadFixture('test/fixtures/15mb.random', 'interface-ipfs-core')
  }),
  sslOpts: Object.freeze({
    key: loadFixture('test/fixtures/ssl/privkey.pem', 'interface-ipfs-core'),
    cert: loadFixture('test/fixtures/ssl/cert.pem', 'interface-ipfs-core')
  })
})
