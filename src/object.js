/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const DAGNode = require('ipfs-merkle-dag').DAGNode
const bs58 = require('bs58')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const promisify = require('promisify-es6')

const checkMultihash = (n1, n2, cb) => {
  parallel([
    (cb) => n1.multihash(cb),
    (cb) => n2.multihash(cb)
  ], (err, res) => {
    if (err) {
      return cb(err)
    }
    cb(null, res[0], res[1])
  })
}
const sameMultihash = promisify((n1, n2, cb) => {
  checkMultihash(n1, n2, (err, h1, h2) => {
    expect(err).to.not.exist
    expect(h2).to.be.eql(h2)
    cb()
  })
})

const differentMultihash = promisify((n1, n2, cb) => {
  checkMultihash(n1, n2, (err, h1, h2) => {
    expect(err).to.not.exist
    expect(h2).to.not.be.eql(h2)
    cb()
  })
})

module.exports = (common) => {
  describe('.object', () => {
    let ipfs

    before(function (done) {
      // CI is slow
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    const putAndGet = promisify((putMethod, obj, getMethod, getParams, getOpts, assertions, done) => {
      if (typeof getOpts === 'function') {
        done = assertions
        assertions = getOpts
        getOpts = undefined
      }

      waterfall([
        (cb) => ipfs.object[putMethod](obj, cb),
        (node, cb) => waterfall([
          (cb) => getParams(node, cb),
          (digest, cb) => {
            if (getOpts) {
              ipfs.object[getMethod](digest, getOpts, cb)
            } else {
              ipfs.object[getMethod](digest, cb)
            }
          }
        ], (err, res) => {
          expect(err).to.not.exist
          assertions(node, res[1], cb)
        })
      ], done)
    })

    describe('callback API', () => {
      describe('.new', () => {
        it('no layout', (done) => {
          waterfall([
            (cb) => ipfs.object.new(cb),
            (node, cb) => node.toJSON(cb),
            (json, cb) => {
              expect(json.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
              cb()
            }
          ], done)
        })
      })

      describe('.put', () => {
        it('of object', (done) => {
          const obj = {
            Data: new Buffer('Some data'),
            Links: []
          }

          waterfall([
            (cb) => ipfs.object.put(obj, cb),
            (node, cb) => node.toJSON(cb),
            (nodeJSON, cb) => {
              expect(obj.Data).to.deep.equal(nodeJSON.Data)
              expect(obj.Links).to.deep.equal(nodeJSON.Links)
              expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
              cb()
            }
          ], done)
        })

        it('of json encoded buffer', (done) => {
          const obj = {
            Data: new Buffer('Some data'),
            Links: []
          }

          const obj2 = {
            Data: obj.Data.toString(),
            Links: obj.Links
          }

          const buf = new Buffer(JSON.stringify(obj2))

          waterfall([
            (cb) => ipfs.object.put(buf, { enc: 'json' }, cb),
            (node, cb) => node.toJSON((err, nodeJSON) => {
              expect(err).to.not.exist

              // because js-ipfs-api can't
              // infer if the returned Data is Buffer or String
              if (typeof node.data === 'string') {
                node.data = new Buffer(node.data)
              }

              expect(obj.Data).to.deep.equal(node.data)
              expect(obj.Links).to.deep.equal(nodeJSON.Links)
              expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
              cb()
            })
          ], done)
        })

        it('of protobuf encoded buffer', (done) => {
          const dNode = new DAGNode(new Buffer('Some data'))
          const buf = dNode.marshal()

          ipfs.object.put(buf, { enc: 'protobuf' }, (err, node) => {
            expect(err).to.not.exist
            expect(dNode.data).to.deep.equal(node.data)
            expect(dNode.links).to.deep.equal(node.links)
            sameMultihash(dNode, node, done)
          })
        })

        it('of buffer treated as Data field', (done) => {
          const data = new Buffer('Some data')
          waterfall([
            (cb) => ipfs.object.put(data, cb),
            (node, cb) => node.toJSON(cb),
            (nodeJSON, cb) => {
              expect(data).to.deep.equal(nodeJSON.Data)
              expect([]).to.deep.equal(nodeJSON.Links)
              expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
              cb()
            }
          ], done)
        })

        it('of DAGNode', (done) => {
          const dNode = new DAGNode(new Buffer('Some data'))
          ipfs.object.put(dNode, (err, node) => {
            expect(err).to.not.exist
            expect(dNode.data).to.deep.equal(node.data)
            expect(dNode.links).to.deep.equal(node.links)
            sameMultihash(dNode, node, done)
          })
        })

        it('fails if String is passed', (done) => {
          ipfs.object.put('aaa', (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('DAGNode with some DAGLinks', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))

          waterfall([
            (cb) => dNode1.addNodeLink('some-link', dNode2, cb),
            (cb) => ipfs.object.put(dNode1, cb),
            (node, cb) => {
              expect(dNode1.data).to.deep.equal(node.data)
              expect(
                dNode1.links.map((l) => l.toJSON())
              ).to.deep.equal(
                node.links.map((l) => l.toJSON())
              )
              sameMultihash(dNode1, node, cb)
            }
          ], done)
        })
      })

      describe('.get', () => {
        it('with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }
          putAndGet(
            'put', testObj,
            'get', (n, cb) => n.multihash(cb),
            (node1, node2, cb) => {
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }

              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
              sameMultihash(node1, node2, cb)
            },
            done
          )
        })

        it('with multihash (+ links)', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))
          dNode1.addNodeLink('some-link', dNode2)

          putAndGet(
            'put', dNode1,
            'get', (n, cb) => n.multihash(cb),
            (node1, node2, cb) => {
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }

              expect(node1.data).to.deep.equal(node2.data)
              sameMultihash(node1, node2, cb)
            },
            done
          )
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'get', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest))
            }),
            {enc: 'base58'},
            (node1, node2, cb) => {
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }

              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
              sameMultihash(node1, node2, cb)
            },
            done
          )
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }
          putAndGet(
            'put', testObj,
            'get', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest).toString())
            }),
            {enc: 'base58'},
            (node1, node2, cb) => {
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }

              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
              sameMultihash(node1, node2, cb)
            },
            done
          )
        })
      })

      describe('.data', () => {
        it('with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'data', (n, cb) => n.multihash(cb),
            (node, data, cb) => {
              // because js-ipfs-api can't infer
              // if the returned Data is Buffer or String
              if (typeof data === 'string') {
                data = new Buffer(data)
              }

              expect(node.data).to.deep.equal(data)
              cb()
            },
            done
          )
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'data', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest))
            }),
            {enc: 'base58'},
            (node, data, cb) => {
              // because js-ipfs-api can't infer
              // if the returned Data is Buffer or String
              if (typeof data === 'string') {
                data = new Buffer(data)
              }
              expect(node.data).to.deep.equal(data)
              cb()
            },
            done
          )
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'data', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest).toString())
            }),
            {enc: 'base58'},
            (node, data, cb) => {
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof data === 'string') {
                data = new Buffer(data)
              }
              expect(node.data).to.deep.equal(data)
              cb()
            },
            done
          )
        })
      })

      describe('.links', () => {
        it('object.links with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'links', (n, cb) => n.multihash(cb),
            (node, links, cb) => {
              expect(node.links).to.deep.equal(links)
              cb()
            },
            done
          )
        })

        it('with multihash (+ links)', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))
          dNode1.addNodeLink('some-link', dNode2)

          putAndGet(
            'put', dNode1,
            'links', (n, cb) => n.multihash(cb),
            (node, links, cb) => {
              expect(node.links[0].toJSON()).to.deep.equal(links[0].toJSON())
              cb()
            },
            done
          )
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'links', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest))
            }),
            {enc: 'base58'},
            (node, links, cb) => {
              expect(node.links).to.deep.equal(links)
              cb()
            },
            done
          )
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'links', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest).toString())
            }),
            {enc: 'base58'},
            (node, links, cb) => {
              expect(node.links).to.deep.equal(links)
              cb()
            },
            done
          )
        })
      })

      describe('.stat', () => {
        it('with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'stat', (n, cb) => n.multihash(cb),
            (node, stats, cb) => {
              const expected = {
                Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
                NumLinks: 0,
                BlockSize: 17,
                LinksSize: 2,
                DataSize: 15,
                CumulativeSize: 17
              }
              expect(expected).to.deep.equal(stats)
              cb()
            },
            done
          )
        })

        it('with multihash (+ Links)', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))
          dNode1.addNodeLink('some-link', dNode2)

          putAndGet(
            'put', dNode1,
            'stat', (n, cb) => n.multihash(cb),
            (node, stats, cb) => {
              const expected = {
                Hash: 'QmPR7W4kaADkAo4GKEVVPQN81EDUFCHJtqejQZ5dEG7pBC',
                NumLinks: 1,
                BlockSize: 64,
                LinksSize: 53,
                DataSize: 11,
                CumulativeSize: 77
              }
              expect(expected).to.deep.equal(stats)
              cb()
            },
            done
          )
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'stat', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest))
            }),
            {enc: 'base58'},
            (node, stats, cb) => {
              const expected = {
                Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
                NumLinks: 0,
                BlockSize: 17,
                LinksSize: 2,
                DataSize: 15,
                CumulativeSize: 17
              }
              expect(expected).to.deep.equal(stats)
              cb()
            },
            done
          )
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          putAndGet(
            'put', testObj,
            'stat', (n, cb) => n.multihash((err, digest) => {
              expect(err).to.not.exist
              cb(null, bs58.encode(digest).toString())
            }),
            {enc: 'base58'},
            (node, stats, cb) => {
              const expected = {
                Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
                NumLinks: 0,
                BlockSize: 17,
                LinksSize: 2,
                DataSize: 15,
                CumulativeSize: 17
              }
              expect(expected).to.deep.equal(stats)
              cb()
            },
            done
          )
        })
      })

      describe('.patch', () => {
        let testNode
        let testNodeWithLink
        let testLink
        before((done) => {
          const obj = {
            Data: new Buffer('patch test object'),
            Links: []
          }

          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist
            testNode = node
            done()
          })
        })

        it('.addLink', (done) => {
          const dNode1 = testNode.copy()
          const dNode2 = new DAGNode(new Buffer('some other node'))
          // note: we need to put the linked obj, otherwise IPFS won't timeout
          // cause it needs the node to get its size

          waterfall([
            (cb) => ipfs.object.put(dNode2, cb),
            (cb) => dNode1.addNodeLink('link-to-node', dNode2, cb),
            (cb) => testNode.multihash(cb),
            (digest, cb) => ipfs.object.patch.addLink(digest, dNode1.links[0], cb),
            (node3, cb) => {
              testNodeWithLink = node3
              testLink = dNode1.links[0]
              sameMultihash(dNode1, node3, cb)
            }
          ], done)
        })

        it('.rmLink', (done) => {
          waterfall([
            (cb) => testNodeWithLink.multihash(cb),
            (digest, cb) => ipfs.object.patch.rmLink(digest, testLink, cb),
            (node, cb) => sameMultihash(node, testNode, cb)
          ], done)
        })

        it('.appendData', (done) => {
          waterfall([
            (cb) => testNode.multihash(cb),
            (digest, cb) => ipfs.object.patch.appendData(digest, new Buffer('append'), cb),
            (node, cb) => differentMultihash(node, testNode, cb)
          ], done)
        })

        it('.setData', (done) => {
          waterfall([
            (cb) => testNode.multihash(cb),
            (digest, cb) => ipfs.object.patch.setData(digest, new Buffer('set'), cb),
            (node, cb) => differentMultihash(node, testNode, cb)
          ], done)
        })
      })
    })

    describe('promise API', () => {
      it('object.new', () => {
        return ipfs.object.new()
          .then((node) => promisify(node.toJSON)())
          .then((json) => {
            expect(json.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          })
      })

      it('object.put', () => {
        const obj = {
          Data: new Buffer('Some data'),
          Links: []
        }

        return ipfs.object.put(obj)
          .then((node) => promisify(node.toJSON)())
          .then((nodeJSON) => {
            expect(obj.Data).to.deep.equal(nodeJSON.Data)
            expect(obj.Links).to.deep.equal(nodeJSON.Links)
            expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
          })
      })

      it('object.get', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node1) => {
            return promisify(node1.multihash)()
              .then((digest) => ipfs.object.get(digest))
              .then((node2) => {
                // because js-ipfs-api can't infer if the returned Data is Buffer
                // or String
                if (typeof node2.data === 'string') {
                  node2.data = new Buffer(node2.data)
                }

                expect(node1.data).to.deep.equal(node2.data)
                expect(node1.links).to.deep.equal(node2.links)
                return sameMultihash(node1, node2)
              })
          })
      })

      it('object.data', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node) => {
            return promisify(node.multihash)()
              .then((digest) => ipfs.object.data(digest))
              .then((data) => {
                // because js-ipfs-api can't infer
                // if the returned Data is Buffer or String
                if (typeof data === 'string') {
                  data = new Buffer(data)
                }
                expect(node.data).to.deep.equal(data)
              })
          })
      })

      it('object.stat', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node) => promisify(node.multihash)())
          .then((digest) => ipfs.object.stat(digest))
          .then((stats) => {
            const expected = {
              Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
              NumLinks: 0,
              BlockSize: 17,
              LinksSize: 2,
              DataSize: 15,
              CumulativeSize: 17
            }
            expect(expected).to.deep.equal(stats)
          })
      })

      it('object.links', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node) => {
            return promisify(node.multihash)()
            .then((digest) => ipfs.object.links(digest))
            .then((links) => {
              expect(node.links).to.deep.equal(links)
            })
          })
      })

      describe('object.patch', () => {
        let testNode
        let testNodeWithLink
        let testLink
        let testNodeHash

        before(() => {
          const obj = {
            Data: new Buffer('patch test object'),
            Links: []
          }

          return ipfs.object.put(obj)
            .then((node) => {
              testNode = node
              return promisify(testNode.multihash)()
            }).then((digest) => {
              testNodeHash = digest
            })
        })

        it('.addLink', () => {
          const dNode1 = testNode.copy()
          const dNode2 = new DAGNode(new Buffer('some other node'))
          // note: we need to put the linked obj, otherwise IPFS won't timeout
          // cause it needs the node to get its size
          return ipfs.object.put(dNode2)
            .then(() => {
              dNode1.addNodeLink('link-to-node', dNode2)

              return ipfs.object.patch
                .addLink(testNodeHash, dNode1.links[0])
                .then((node3) => {
                  testNodeWithLink = node3
                  testLink = dNode1.links[0]
                  return sameMultihash(dNode1, node3)
                })
            })
        })

        it('.rmLink', () => {
          return promisify(testNodeWithLink.multihash)()
            .then((digest) => ipfs.object.patch.rmLink(digest, testLink))
            .then((node) => sameMultihash(node, testNode))
        })

        it('.appendData', () => {
          return ipfs.object.patch
            .appendData(testNodeHash, new Buffer('append'))
            .then((node) => sameMultihash(node, testNode))
        })

        it('.setData', () => {
          return ipfs.object.patch
            .appendData(testNodeHash, new Buffer('set'))
            .then((node) => sameMultihash(node, testNode))
        })
      })
    })
  })
}
