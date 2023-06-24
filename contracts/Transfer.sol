// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FundTransfer {
    address private owner;
    mapping(address => bool) private permissions;
    mapping(address => uint256) private balances;
    uint256 public gasFee = 100000000000000; // 0.0001 ether

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    modifier onlyPermitted() {
        require(permissions[msg.sender], "You don't have permission to perform this operation.");
        _;
    }

    constructor() {
        owner = msg.sender;
        permissions[msg.sender] = true;
    }

    function deposit() public payable onlyPermitted {
        balances[msg.sender] += msg.value - gasFee;
    }

    function withdraw(uint256 amount) public onlyPermitted {
        require(amount <= balances[msg.sender], "Insufficient balance.");

        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function getBalance() public view returns (uint256) {
        require(permissions[msg.sender] || msg.sender == owner, "You don't have permission to view the balance.");
        return balances[msg.sender];
    }

    function checkPermission(address user) public view returns (bool) {
    if (msg.sender == user) {
        return permissions[user];
    } else if (msg.sender == owner) {
        return permissions[user];
    } else {
        revert("You don't have permission to perform this operation.");
    }
    }

    function givePermission(address user) public onlyOwner {
        permissions[user] = true;
    }

    function removePermission(address user) public onlyOwner {
        require(user != owner, "The owner cannot have permissions revoked.");
        permissions[user] = false;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function transfer(address to, uint256 amount) public onlyPermitted {
    require(amount <= balances[msg.sender], "Insufficient balance.");
    require(amount +gasFee<= balances[msg.sender] , "Insufficient balance to cover transfer amount and gas fee.");

    balances[msg.sender] -= amount;
    balances[to] += amount;
    balances[msg.sender] -= gasFee;
}
    function getOwner() public view returns (address) {
        return owner;
    }


}
