const Wallet = artifacts.require("Wallet");

contract("Wallet", accounts => {
    let wallet;
    const owner = accounts[0];

    beforeEach(async () => {
        wallet = await Wallet.new({ from: accounts[0] });
    });

    // it("should allow owner to deposit funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     await wallet.deposit({ from: accounts[0], value: amount });
    //     const balance = await wallet.getBalance({ from: accounts[0] });
    //     assert.equal(balance, amount, "Balance is incorrect");
    // });

    // PASS
    // it("should allow owner to deposit funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");

    //     await wallet.deposit({ from: owner, value: amount });

    //     const balance = await web3.eth.getBalance(wallet.address);
    //     assert.equal(balance, amount, "Contract balance should be equal to deposited amount");
    // });

    // **it("should not allow non-owner to deposit funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     try {
    //         await wallet.deposit({ from: accounts[1], value: amount });
    //     } catch (error) {
    //         assert(error.message.includes("Only owner can call this function"), "Error: " + error);
    //         return;
    //     }
    //     assert(false, "Expected throw not received");
    // });

    it("should allow permissible user to deposit funds", async () => {
        const user = accounts[1];
        const gasPrice = await web3.eth.getGasPrice();
        const amount = web3.utils.toWei('1', 'ether');
        await wallet.givePermission(user, { from: owner });
        const initialBalance = await wallet.getBalance(user);
        await wallet.deposit({ from: user, value: amount, gasPrice: gasprice });
        const finalBalance = await wallet.getBalance(user);
        assert.equal(finalBalance.toString(), initialBalance.add(new BN(amount)).toString());
    });



    // it("should not allow not permissible user to deposit funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     let isPermissioned = false;
    //     try {
    //         await walletInstance.deposit({ from: notPermissibleUser, value: amount });
    //     } catch (e) {
    //         isPermissioned = true;
    //     }
    //     assert.equal(isPermissioned, true, "Not permissible user should not be able to deposit funds");
    // });

    // it("should allow owner to transfer funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     await wallet.deposit({ from: accounts[0], value: amount });
    //     await wallet.givePermission(accounts[1], { from: accounts[0] });
    //     await wallet.transfer(accounts[1], amount, { from: accounts[0] });
    //     const balance = await wallet.getBalance({ from: accounts[1] });
    //     assert.equal(balance, amount, "Balance is incorrect");
    // });

    // it("should not allow non-permissible user to transfer funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     await wallet.deposit({ from: accounts[0], value: amount });
    //     await wallet.givePermission(accounts[1], { from: accounts[0] });
    //     try {
    //         await wallet.transfer(accounts[2], amount, { from: accounts[1] });
    //     } catch (error) {
    //         assert(error.message.includes("Only permissible users can call this function"), "Error: " + error);
    //         return;
    //     }
    //     assert(false, "Expected throw not received");
    // });

    // it("should allow permissible user to transfer funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     await walletInstance.givePermission(permissibleUser, { from: owner });
    //     await walletInstance.deposit({ from: owner, value: amount });
    //     await walletInstance.transfer(permissibleUser, amount, { from: owner });
    //     const ownerBalance = await walletInstance.getBalance({ from: owner });
    //     const permissibleUserBalance = await walletInstance.getBalance({ from: permissibleUser });
    //     assert.equal(ownerBalance, 0, "Owner balance should be 0 after transfer");
    //     assert.equal(permissibleUserBalance, amount, "Permissible user should receive transferred funds");
    //   });

    // it("should allow permissible user to withdraw funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     await wallet.deposit({ from: accounts[0], value: amount });
    //     await wallet.givePermission(accounts[1], { from: accounts[0] });
    //     await wallet.withdraw(amount, { from: accounts[1] });
    //     const balance = await wallet.getBalance({ from: accounts[0] });
    //     assert.equal(balance, 0, "Balance is incorrect");
    // });

    // it("should not allow non-permissible user to withdraw funds", async () => {
    //     const amount = web3.utils.toWei("1", "ether");
    //     await wallet.deposit({ from: accounts[0], value: amount });
    //     try {
    //         await wallet.withdraw(amount, { from: accounts[1] });
    //     } catch (error) {
    //         assert(error.message.includes("Only permissible users can call this function"), "Error: " + error);
    //         return;
    //     }
    //     assert(false, "Expected throw not received");
    // });
});
