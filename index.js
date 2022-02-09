const { Blockchain } = require("./blockchain");
const express = require('express');
const bodyParser = require('body-parser');
const Peer2Peer = require('./p2p-server.js');

const HTTP_PORT = process.argv[2] || 3001;
const P2P_PORT = process.argv[3] || 5001;
const PEERS = process.argv[4] ? process.argv[4].split(',') : [];

// Setup blockchain
const blockchain = new Blockchain();

// Setup Peer to Peer
const p2p = new Peer2Peer(P2P_PORT, PEERS, blockchain);
p2p.listen();

// Setup Webserver
const app = express();
app.use(bodyParser.json());

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
})

app.get('/mine',(req,res)=>{
    const block = blockchain.addBlock({value: Math.floor(Math.random() * 100)});
    console.log(`New block added: ` + block.hash);
    p2p.syncChain();
    res.redirect('/blocks');
});

app.get('/blocks',(req,res)=>{
    res.json(blockchain.chain);
});





