const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionHash: String,
    fromAddress: String,
    toAddress: String,
    amount: Number,
    type: String,
    blockNumber: Number,
    gasUsed: String,
    cumulativeGasUsed: String,
    status: Boolean,
    timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
