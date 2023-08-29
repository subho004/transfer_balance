const express = require('express');
const { Web3 } = require('web3');
const cors = require('cors');
const walletContract = require('./build/contracts/FundTransfer.json');
const mongoose = require('./Database/TransactionDb');
const Transaction = require('./Transaction');
require('dotenv').config();
const TransactionStore = require('./components/Transaction/TransactionStore');
const PermissionStore = require('./components/Permission/PermissionStore');


// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());


// Connect to the local Ethereum node
const web3 = new Web3('http://localhost:7545');

// Contract ABI (Application Binary Interface)
const contractABI = walletContract.abi;
// Retrieve the contract ABI and bytecode from the JSON file
const contractBytecode = walletContract.bytecode;

// Contract address
const contractAddress = '0x688Ee11bCb0707B7F465b662ac9Df069F98a8aE5';

// Create a contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Define the gas fee
const gasFee = BigInt("100000000000000"); // 0.0001 ether

/// Retrieve all transactions
app.get('/transactions', async (req, res) => {
    try {
        const transactions = await TransactionStore.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get a transaction by transaction hash
app.get('/transaction/:transactionHash', async (req, res) => {
    try {
        const { transactionHash } = req.params;
        const transaction = await TransactionStore.getTransactionByHash(transactionHash);
        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to get the balance of an address(working)
app.get('/balance/:address', async (req, res) => {
    try {
        const address = req.params.address;

        // Get the balance
        const balance = await contract.methods.getBalance().call({ from: address });

        res.json({ balance: balance.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get balance' });
    }
});

// Endpoint to deposit(working)
app.post('/deposit', async (req, res) => {
    try {
        const { address, amount } = req.body;

        // Convert the amount to wei as a BigInt
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');

        // Check if the caller is the owner or permitted user
        const ownerAddress = await contract.methods.getOwner().call();
        const hasPermission = await contract.methods.checkPermission(address).call({ from: ownerAddress });
        if (!hasPermission) {
            return res.status(403).json({ error: 'Permission denied' });
        }



        // Deposit the amount to the contract
        const receipt = await contract.methods.deposit().send({
            from: address,
            value: amountWei
        });

        // Save the deposit transaction to the database
        const depositTransaction = new Transaction({
            transactionHash: receipt.transactionHash,
            fromAddress: address,
            toAddress: contractAddress, // Assuming contract address is the recipient
            amount: amount, // Store the amount in ether
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            status: Boolean(receipt.status),
            type: 'deposit',
        });
        await depositTransaction.save();

        const serializedReceipt = {
            transactionHash: receipt.transactionHash,
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            status: Boolean(receipt.status),
            //logs: receipt.logs
        };

        res.json({ message: 'Deposit successful', receipt: serializedReceipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to deposit amount' });
    }
});

// Endpoint to withdraw funds(working)
app.post('/withdraw', async (req, res) => {
    try {
        const { address, amount } = req.body;

        // Convert the amount to wei as a BigInt
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');

        // Check if the caller is the owner or permitted user
        const ownerAddress = await contract.methods.getOwner().call();
        const hasPermission = await contract.methods.checkPermission(address).call({ from: ownerAddress });
        if (!hasPermission) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Check if the contract has sufficient balance
        const balance = await contract.methods.getBalance().call({ from: address });
        if (BigInt(amountWei) > BigInt(balance)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Perform the withdrawal
        const receipt = await contract.methods.withdraw(amountWei).send({ from: address });

        // Save the withdrawal transaction to the database
        const withdrawalTransaction = new Transaction({
            transactionHash: receipt.transactionHash,
            fromAddress: address,
            toAddress: contractAddress, // Assuming contract address is the sender
            amount: amount, // Store the amount in ether
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            status: Boolean(receipt.status),
            type: 'withdrawal',
        });
        await withdrawalTransaction.save();

        // Serialize the receipt with necessary conversions
        const serializedReceipt = {
            transactionHash: receipt.transactionHash,
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            status: Boolean(receipt.status),
            //logs: receipt.logs
        };

        res.json({ message: 'Withdraw successful', receipt: serializedReceipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to withdraw amount' });
    }
});

// Endpoint to transfer funds(working)
app.post('/transfer', async (req, res) => {
    try {
        const { address, to, amount } = req.body;

        // Convert the amount to wei as a BigInt
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');

        // Check if the caller is the owner or permitted user
        const ownerAddress = await contract.methods.getOwner().call();
        const hasPermission = await contract.methods.checkPermission(address).call({ from: ownerAddress });
        if (!hasPermission) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Check if the contract has sufficient balance
        const balance = await contract.methods.getBalance().call({ from: address });
        if (BigInt(amountWei) > BigInt(balance)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Call the contract's transfer function
        const receipt = await contract.methods.transfer(to, amount).send({ from: address });

        // Save the transfer transaction to the database
        const transferTransaction = new Transaction({
            transactionHash: receipt.transactionHash,
            fromAddress: address,
            toAddress: to,
            amount: amount, // Store the amount in ether
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            status: Boolean(receipt.status),
            type: 'transfer',
        });
        await transferTransaction.save();

        // Serialize the receipt with necessary conversions
        const serializedReceipt = {
            transactionHash: receipt.transactionHash,
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            status: Boolean(receipt.status),
            //logs: receipt.logs
        };

        res.json({ message: 'Transaction successful', receipt: serializedReceipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to transfer funds' });
    }
});

// Endpoint to check permission of an address
app.get('/checkPermission/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const permission = await PermissionStore.checkPermission(address);
        res.json(permission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to give permission to a user
app.post('/givePermission', async (req, res) => {
    try {
        const { user, address } = req.body;
        const result = await PermissionStore.givePermission(user, address);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to remove permission from an address
app.post('/removePermission', async (req, res) => {
    try {
        const { user, address } = req.body;
        const result = await PermissionStore.removePermission(user, address);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get the gas fee
app.get('/gasFee', async (req, res) => {
    try {
        const gasFee = await PermissionStore.getGasFee(req.query.address);
        res.json(gasFee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to check if the caller is the owner
app.get('/isOwner/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const isOwner = await PermissionStore.isOwner(address);
        res.json(isOwner);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
