'use strict'

const { promisify } = require('es6-promisify')
const dagPb = require('ipld-dag-pb')
const { DAGNode, DAGLink } = dagPb

module.exports.createDAGNode = promisify((data, links, cb) => {
  DAGNode.create(data, links, cb)
})

module.exports.addLinkToDAGNode = promisify((parent, link, cb) => {
  DAGNode.addLink(parent, link, cb)
})

module.exports.asDAGLink = promisify((node, name, cb) => {
  if (typeof name === 'function') {
    cb = name
    name = ''
  }

  dagPb.util.cid(node, (err, nodeCid) => {
    if (err) {
      return cb(err)
    }

    DAGLink.create(name, node.size, nodeCid, cb)
  })
})
