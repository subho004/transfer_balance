const Transaction = require('../../Transaction');

// Function to retrieve all transactions
async function getAllTransactions() {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        return transactions;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve transactions');
    }
}

// Function to retrieve a transaction by transaction hash
async function getTransactionByHash(transactionHash) {
    try {
        const transaction = await Transaction.findOne({ transactionHash });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve transaction');
    }
}

module.exports = {
    getAllTransactions,
    getTransactionByHash,
};
