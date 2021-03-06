 
const crypto = require('crypto');
const Swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const getPort = require('get-port');
const readline = require('readline');
const io = require('socket.io')();
const fs  = require("fs");

const {transSigCreate} = require("./sign.js");
const {checkBranch}  =require("./spv.js")
const peers = {}
// Counter for connections, used to identify connections
let connSeq = 0

// Peer Identity, a random hash for identify your peer
const myId = crypto.randomBytes(32)
console.log('Your identity: ' + myId.toString('hex'))

// reference to redline interface
let rl

function log () {
  if (rl) {
    rl.clearLine()
    rl.close()
    rl = undefined
  }
  for (let i = 0, len = arguments.length; i < len; i++) {
    console.log(arguments[i])
  }
  askUser()
}

const askUser = async () => {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('Send message: ', message => {
    // Broadcast to peers
    for (let id in peers) {
      peers[id].conn.write(JSON.stringify({"text" : message, "me" : myId.toString("hex")},undefined,2))
    }    
    rl.close()
    rl = undefined
    askUser()
  });
}

/** 
 * Default DNS and DHT servers
 * This servers are used for peer discovery and establishing connection
 */
const config = defaults({
  // peer-id
  id: myId,
})

/**
 * discovery-swarm library establishes a TCP p2p connection and uses
 * discovery-channel library for peer discovery
 */
const sw = Swarm(config)


;(async () => {

  const port = await getPort()
  sw.listen(port)
  console.log('Listening to port: ' + port)


  const port2 = 8000;
io.listen(port2);
console.log('listening on port ', port2);

io.on('connection', (client) => {
  client.on('sendTransaction', async(transaction) => {
    console.log(transaction);
    
    var signature = await transSigCreate(transaction);
    
    if(transaction.buyerSignature === ""){
      transaction["buyerSignature"] = signature;
      console.log(transaction)
      fs.writeFileSync("./outputs/draft.json",JSON.stringify(transaction,undefined,2));    
    }
    else{
      transaction["sellerSignature"] = signature;

      console.log(transaction)
      
      var pendingTrans = JSON.parse(fs.readFileSync("./src/pendingTrans.json").toString(),undefined,2)    
      pendingTrans.push(transaction)
      fs.writeFileSync("./src/pendingTrans.json",JSON.stringify(pendingTrans,undefined,2));    
      delete pendingTrans;
    }
    

    for (let id in peers) {
      peers[id].conn.write(JSON.stringify(transaction,undefined,2))
    }

    setTimeout(() => {
      for (let id in peers) {
        peers[id].conn.write(JSON.stringify({
        class: "verTransaction",
        data: {
          landId: transaction.data.landID
          } 
        },undefined,2))
      }
    },2000);
  });

  client.on("verifyTransaction", async () => {
    var pendingTrans = JSON.parse(fs.readFileSync("./src/pendingTrans.json").toString(),undefined,2)
    console.log("pend", pendingTrans.data.landID, pendingTrans.data)            
  })
});

  /**
   * The channel we are connecting to.
   * Peers should discover other peers in this channel
   */
sw.join('catalyst')

  sw.on('connection', (conn, info) => {
    // Connection id
    const seq = connSeq

    const peerId = info.id.toString('hex')
    log(`Connected #${seq} to peer: ${peerId}`)

    // Keep alive TCP connection with peer
    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600)
      } catch (exception) {
        log('exception', exception)
      }
    }

    conn.on('data', async (data) => {
      // Here we handle incomming messages
      console.log("message recieved - ", data.toString());      
      var message = JSON.parse(data);      
      if(message!= null && message!= undefined && message.class!= null && message.class!= undefined && message.class == "verReply"){
        if(message.class == "verReply"){
          checkBranch(message).then((flag)=>{
            if(flag){
              console.log(`Transaction included in Block No. ${message.data.blockHeader.blockHeight}`);
              socket.emit("changeStatus", `Transaction included in Block No. ${message.data.blockHeader.blockHeight}`)
            }
            else{
              console.log("Branch not correct")
            }
          })
        }
      }
    })

    conn.on('close', () => {
      // Here we handle peer disconnection
      log(`Connection ${seq} closed, peer id: ${peerId}`)
      // If the closing connection is the last connection with the peer, removes the peer
      if (peers[peerId].seq === seq) {
        delete peers[peerId]
      }
    })

    // Save the connection
    if (!peers[peerId]) {
      peers[peerId] = {}
    }
    peers[peerId].conn = conn
    peers[peerId].seq = seq
    connSeq++

  })

  askUser()  

})()
