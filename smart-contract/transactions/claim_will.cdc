/// Transaction for beneficiary to claim inheritance distribution

import LastTx from 0xf8d6e0586b0a20c7
import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

transaction(ownerAddress: Address, lastTxId: UInt64) {
    
    let beneficiaryVault: &FlowToken.Vault
    let lastTxCollection: &LastTx.Collection
    
    prepare(beneficiarySigner: auth(Storage) &Account) {
        /// Get beneficiary's vault to receive inheritance
        self.beneficiaryVault = beneficiarySigner.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!
        
        /// Get reference to owner's LastTx collection
        let ownerAccount = getAccount(ownerAddress)
        self.lastTxCollection = ownerAccount.capabilities.borrow<&LastTx.Collection>(LastTx.LastTxPublicPath)!
    }
    
    execute {
        /// Execute inheritance claim
        let success = self.lastTxCollection.claimInheritance(
            id: lastTxId,
            beneficiaryVault: self.beneficiaryVault
        )
        
        if success {
            log("Inheritance claimed successfully!")
        } else {
            log("Inheritance claim failed!")
        }
    }
}
