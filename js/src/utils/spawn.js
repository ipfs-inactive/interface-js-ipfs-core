'use strict'

async function identify (node) {
  node.peerId = await node.id()
  return node
}

// Spawn a node, get it's id and set it as `peerId` on the node
async function spawnNodeWithId (factory) {
  return identify(await factory.spawnNode())
}

exports.spawnNodeWithId = spawnNodeWithId

// Spawn n nodes
async function spawnNodes (n, factory) {
  let nodes = []
  for (let i = 0; i < n; i++) nodes.push(await factory.spawnNode())
  return nodes
}

exports.spawnNodes = spawnNodes

// Spawn n nodes, getting their id's and setting them as `peerId` on the nodes
async function spawnNodesWithId (n, factory) {
  const nodes = await spawnNodes(n, factory)
  return Promise.all(nodes.map(node => identify(node)))
}

exports.spawnNodesWithId = spawnNodesWithId
