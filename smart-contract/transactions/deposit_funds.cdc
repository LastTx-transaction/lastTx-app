// Transaction to deposit FLOW tokens into a LastTx

import LastTx from "../contracts/LastTx.cdc"
import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61

transaction(lastTxId: UInt64, amount: UFix64) {
    let collectionRef: &LastTx.Collection
    let flowVault: &FlowToken.Vault
    
    prepare(signer: AuthAccount) {
        // Get reference to LastTx collection
        self.collectionRef = signer.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx collection from storage")
        
        // Get reference to Flow vault
        self.flowVault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault from storage")
    }
    
    execute {
        // Get reference to the LastTx
        let lastTxRef = self.collectionRef.borrowLastTx(id: lastTxId)
            ?? panic("Could not borrow LastTx reference")
        
        // Withdraw from user's Flow vault
        let depositVault <- self.flowVault.withdraw(amount: amount)
        
        // Deposit into LastTx
        lastTxRef.deposit(from: <-depositVault)
        
        log("Deposited ".concat(amount.toString()).concat(" FLOW tokens to LastTx ID: ").concat(lastTxId.toString()))
        
        // Get updated details
        let details = lastTxRef.getDetails()
        let newBalance = details["balance"] as! UFix64? ?? 0.0
        log("New balance: ".concat(newBalance.toString()).concat(" FLOW"))
    }
}
