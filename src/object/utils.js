'use strict'

const dagPB = require('ipld-dag-pb')
const { DAGLink } = dagPB

module.exports.asDAGLink = async (node, name) => {
  name = name || ''

  const nodeCid = await dagPB.util.cid(dagPB.util.serialize(node), { cidVersion: 0 })
  return new DAGLink(name, node.size, nodeCid)
}
