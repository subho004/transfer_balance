const express = require('express');
const { Web3 } = require('web3');
const cors = require('cors');
const walletContract = require('./build/contracts/FundTransfer.json');

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
const contractAddress = '0x3A5a3fCeF010E6B81E58c86bBbCD98a9B54BB3f0';

// Create a contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Define the gas fee
const gasFee = BigInt("100000000000000"); // 0.0001 ether

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

// Endpoint to check permission of an address(working)
app.get('/checkPermission/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const owner = await contract.methods.getOwner().call();
        const permission = await contract.methods.checkPermission(address).call({ from: owner });
        res.json({ permission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while executing the smart contract function.' });
    }
});


// Endpoint to give permission to a user(working)
app.post('/givePermission', async (req, res) => {
    try {
        const { user, address } = req.body;
        const ownerAddress = await contract.methods.getOwner().call();
        // Check if the caller is the owner
        if (user !== ownerAddress) {
            res.status(403).json({ error: 'Only the owner can call this function.' });
            return;
        }

        // Give permission to the user
        await contract.methods.givePermission(address).send({ from: ownerAddress });

        res.json({ success: true, message: 'Permission revoked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to give permission' });
    }
});

// Endpoint to remove permission from an address(working)
app.post('/removePermission', async (req, res) => {
    try {
        const { user, address } = req.body;
        //const ownerAddress = await web3.eth.getAccounts().then(accounts => accounts[0]);
        const ownerAddress = await contract.methods.getOwner().call();
        // Check if the caller is the owner
        if (user !== ownerAddress) {
            res.status(403).json({ error: 'Only the owner can call this function.' });
            return;
        }

        // Perform the permission revocation transaction
        await contract.methods.removePermission(address).send({ from: ownerAddress });

        res.json({ success: true, message: 'Permission revoked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to revoke permission' });
    }
});

// Endpoint to check if the caller is the owner(working)
app.get('/isOwner/:address', async (req, res) => {
    try {
        const address = req.params.address;

        // Check if the address is the owner
        const isOwner = await contract.methods.isOwner().call({ from: address });

        res.json({ isOwner });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check ownership' });
    }
});

// Endpoint to get the gas fee(working)
app.get('/gasFee', async (req, res) => {
    try {
        // Get the gas fee
        const gasFee = await contract.methods.gasFee().call({ from: req.query.address });

        res.json({ gasFee: gasFee.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get gas fee' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
