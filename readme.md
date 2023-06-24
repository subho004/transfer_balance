The SOW is that we need to create a smart contract to transfer funds from
one account to another with a minimal gas fee for every transaction

1. deployed line 6 to 8. Account[0] is the genesis account 
   i.e the first account

2.line 11 to 16 deposit test case
 line 12 converted ether to wei 
 line 13 deposit amount to account[1] 
 line 14 return balance of the message sender

3. line 18 to 27 withdraw test case
 line 20 converted the amount to big number as it was showing a error of type
 conversion
 line 23 withdraw given amount from account

**TASK**
Client will call an API 
API will call the buisness logic(DApp, Node.js/Java)
Now it will submit the transaction to the blockchain using smart contracts
Add restictions such that only allowed users can perform operations
Develop event listener and Prepare a notification for client