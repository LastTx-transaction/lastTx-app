// Transaction to distribute funds from an expired LastTx

import LastTx from "../contracts/LastTx.cdc"
import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61

transaction(ownerAddress: Address, lastTxId: UInt64) {
    
    prepare(signer: AuthAccount) {
        // This transaction can be called by anyone
        log("Attempting to distribute funds from expired LastTx...")
    }
    
    execute {
        // Get owner's collection reference
        let ownerAccount = getAccount(ownerAddress)
        let ownerCollectionRef = ownerAccount
            .getCapability<&LastTx.Collection{LastTx.LastTxPublic}>(LastTx.LastTxPublicPath)
            .borrow()
            ?? panic("Could not borrow LastTx collection from owner")
        
        // Get reference to the specific LastTx
        let lastTxRef = ownerCollectionRef.borrowLastTx(id: lastTxId)
            ?? panic("Could not find LastTx with ID: ".concat(lastTxId.toString()))
        
        // Check if LastTx is expired
        if !lastTxRef.isExpired() {
            panic("LastTx has not expired yet. Time remaining: ".concat(lastTxRef.getTimeRemaining().toString()).concat(" seconds"))
        }
        
        // Get LastTx details to access beneficiaries
        let details = lastTxRef.getDetails()
        let beneficiaries = details["beneficiaries"]! as! [LastTx.Beneficiary]
        let totalAmount = details["balance"]! as! UFix64
        
        if totalAmount <= 0.0 {
            panic("No funds available for distribution")
        }
        
        log("Distributing ".concat(totalAmount.toString()).concat(" FLOW to ").concat(beneficiaries.length.toString()).concat(" beneficiaries"))
        
        // Distribute funds
        let distributions <- lastTxRef.distributeFunds()
        
        // Send funds to each beneficiary
        var i = 0
        while i < distributions.length && i < beneficiaries.length {
            let beneficiaryAddress = beneficiaries[i].address
            let beneficiaryName = beneficiaries[i].name ?? "Unnamed"
            let beneficiaryVault <- distributions.removeFirst()
            let amount = beneficiaryVault.balance
            
            // Get beneficiary's Flow token receiver
            let beneficiaryReceiver = getAccount(beneficiaryAddress)
                .getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                .borrow()
                ?? panic("Could not access beneficiary's Flow token receiver at address: ".concat(beneficiaryAddress.toString()))
            
            // Deposit funds to beneficiary
            beneficiaryReceiver.deposit(from: <-beneficiaryVault)
            
            log("Sent ".concat(amount.toString()).concat(" FLOW to ").concat(beneficiaryName).concat(" (").concat(beneficiaryAddress.toString()).concat(")"))
            
            i = i + 1
        }
        
        // Destroy any remaining distributions (should be empty)
        destroy distributions
        
        log("✅ LastTx execution completed successfully!")
        log("All funds have been distributed to beneficiaries as per the owner's wishes.")
    }
}
