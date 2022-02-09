const { WebSocketServer, WebSocket }  = require('ws');

class Peer2Peer {
    constructor(p2p_port, peers, blockchain) {
        this.p2p_port = p2p_port;
        this.blockchain = blockchain;
        this.peers = peers;
        this.sockets = [];
    }

    listen() {
        const wss = new WebSocketServer({ port: this.p2p_port });
        wss.on('connection', (socket, request) => {
            const ip = request.socket.remoteAddress;
            const port = request.socket.remotePort;
            console.log(ip + " " + port);
            this.connectSocket(socket);
        });
        console.log(`Listening for peer to peer connection on port : ${this.p2p_port}...`);
        this.connectToPeers();
    }

    messageHandler(socket) {
        socket.on('message', (message) =>{
            const data = JSON.parse(message);
            console.log("Data: ", data);
            this.blockchain.replaceChain(data);
        });
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        this.messageHandler(socket);
        this.sendChain(socket);
    }

    connectToPeers() {
        this.peers.forEach((peer) => {
            console.log("Connecting to peer web socket " + peer);
            const socket = new WebSocket(peer);
            socket.on('open', () => {
                this.connectSocket(socket);
            });
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify(this.blockchain.chain));
    }

    syncChain() {
        this.sockets.forEach((socket) => {
            this.sendChain(socket);
        });
    }
}

module.exports = Peer2Peer;
