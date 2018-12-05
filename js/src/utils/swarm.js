'use strict'

const pause = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

async function connect (fromNode, toAddrs, cb) {
  if (!Array.isArray(toAddrs)) {
    toAddrs = [toAddrs]
  }

  // FIXME ??? quick connections to different nodes sometimes cause no
  // connection and no error, hence serialize connections and pause between
  for (let i = 0; i < toAddrs.length; i++) {
    await fromNode.swarm.connect(toAddrs[i])
    await pause(300)
  }
}

module.exports.connect = connect
