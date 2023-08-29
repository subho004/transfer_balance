const { Web3 } = require('web3');
//const walletContract = require('./build/contracts/FundTransfer.json');
const walletContract = require('../../build/contracts/FundTransfer.json');

// Connect to the local Ethereum node
const web3 = new Web3('http://localhost:7545');

// Contract ABI (Application Binary Interface)
const contractABI = walletContract.abi;

// Contract address
const contractAddress = '0x688Ee11bCb0707B7F465b662ac9Df069F98a8aE5';

// Create a contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to check permission of an address
async function checkPermission(address) {
    try {
        const owner = await contract.methods.getOwner().call();
        const permission = await contract.methods.checkPermission(address).call({ from: owner });
        return permission;
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while executing the smart contract function.');
    }
}

// Function to give permission to a user
async function givePermission(user, address) {
    try {
        const ownerAddress = await contract.methods.getOwner().call();
        // Check if the caller is the owner
        if (user !== ownerAddress) {
            throw new Error('Only the owner can call this function.');
        }

        // Give permission to the user
        await contract.methods.givePermission(address).send({ from: ownerAddress });
        return { success: true, message: 'Permission granted successfully' };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to grant permission');
    }
}

// Function to remove permission from an address
async function removePermission(user, address) {
    try {
        const ownerAddress = await contract.methods.getOwner().call();
        // Check if the caller is the owner
        if (user !== ownerAddress) {
            throw new Error('Only the owner can call this function.');
        }

        // Perform the permission revocation transaction
        await contract.methods.removePermission(address).send({ from: ownerAddress });
        return { success: true, message: 'Permission revoked successfully' };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to revoke permission');
    }
}

// Function to get the gas fee
async function getGasFee(address) {
    try {
        // Get the gas fee
        const gasFee = await contract.methods.gasFee().call({ from: address });
        return { gasFee: gasFee.toString() };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get gas fee');
    }
}

// Function to check if the caller is the owner
async function isOwner(address) {
    try {
        // Check if the address is the owner
        const isOwner = await contract.methods.isOwner().call({ from: address });
        return { isOwner };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to check ownership');
    }
}

module.exports = {
    checkPermission,
    givePermission,
    removePermission,
    getGasFee,
    isOwner,
};
