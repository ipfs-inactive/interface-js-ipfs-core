'use strict'

const loadFixture = require('aegir/fixtures')

exports.fixtures = Object.freeze({
  directory: Object.freeze({
    cid: 'QmVJV2VF9Qf7rJUFdimhpZDhkyyumM1i4CjjGcss5rqJPa',
    files: Object.freeze([Object.freeze({
      path: 'test-folder/ipfs-add.js',
      data: loadFixture('js/test/fixtures/test-folder/ipfs-add.js', 'interface-ipfs-core'),
      cid: 'QmU7wetVaAqc3Meurif9hcYBHGvQmL5QdpPJYBoZizyTNL'
    }), Object.freeze({
      path: 'test-folder/files/ipfs.txt',
      data: loadFixture('js/test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core'),
      cid: 'QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w'
    })])
  }),
  files: Object.freeze([Object.freeze({
    data: loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core'),
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
  }), Object.freeze({
    data: loadFixture('test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
    cid: 'QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu'
  })])
})
