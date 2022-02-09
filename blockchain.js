const crypto = require("crypto");

const sha256 = (message) => {
    return crypto.createHash("sha256").update(message).digest("hex");
}

class Block {
    static genesis() {
        return new this('Genesis time');
    }

    constructor(timestamp = "", data = {}) {
        const n = 0;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = Block.getHash(timestamp, data, n);
        this.prevHash = "";
        this.nonce = n;
    }

    static getHash(timestamp, data, nonce) {
        return sha256(timestamp + JSON.stringify(data) + nonce);
    }

    static mineBlock(lastBlock, difficulty, data) {
        let nonce = 0;
        let hash = "";
        let timestamp = Date.now().toString();

        while (hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            nonce++;
            hash = Block.getHash(timestamp, data, nonce);
        }

        let block = new Block(timestamp, data)
        block.hash = hash;
        block.prevHash = lastBlock.hash;
        block.nonce = nonce;
        return block;
    }
}

class Blockchain {

    constructor() {
        this.chain = [Block.genesis()];
        this.difficulty = 3;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        let block = Block.mineBlock(this.getLatestBlock(), this.difficulty, data);
        this.chain.push(block);
        return block;
    }

    static isValid(chain) {
        if (chain.length === 1) return true;

        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const prevBlock = chain[i - 1];
            if (currentBlock.hash !== Block.getHash(currentBlock.timestamp, currentBlock.data, currentBlock.nonce) ||
                prevBlock.hash !== currentBlock.prevHash)
            {
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain)
    {
        if (newChain.length < this.chain.length) {
            console.log("Received chain is NOT longer than the current chain");
            return;
        }

        if (!Blockchain.isValid(newChain)) {
            console.log("Received chain is INVALID!");
            return;
        }

        console.log("Replacing the current chain with new chain...");
        this.chain = newChain;
    }

}

module.exports.Block = Block;
module.exports.Blockchain = Blockchain;
