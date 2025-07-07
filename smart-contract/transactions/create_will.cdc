/// Transaction to create a new LastTx inheritance will

import LastTx from 0xf8d6e0586b0a20c7
import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

transaction(
    beneficiaryAddress: Address, 
    percentage: UFix64,
    inactivityDuration: UFix64,
    beneficiaryName: String,
    personalMessage: String
) {
    let collection: &LastTx.Collection
    let vaultCapability: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        /// Setup LastTx collection if not exists
        if signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath) == nil {
            signer.storage.save(<-LastTx.createEmptyCollection(), to: LastTx.LastTxStoragePath)
            
            let publicCap = signer.capabilities.storage.issue<&LastTx.Collection>(LastTx.LastTxStoragePath)
            signer.capabilities.publish(publicCap, at: LastTx.LastTxPublicPath)
        }
        
        self.collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)!
        
        /// Create vault capability for inheritance distribution
        self.vaultCapability = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &FlowToken.Vault>(/storage/flowTokenVault)
    }
    
    execute {
        let beneficiary = LastTx.createBeneficiary(
            address: beneficiaryAddress,
            percentage: percentage,
            name: beneficiaryName == "" ? nil : beneficiaryName
        )
        let beneficiaries: [LastTx.Beneficiary] = [beneficiary]
        
        let lastTxId = self.collection.createLastTx(
            inactivityDuration: inactivityDuration,
            beneficiaries: beneficiaries,
            personalMessage: personalMessage == "" ? nil : personalMessage,
            vaultCapability: self.vaultCapability
        )
        
        log("LastTx inheritance will created successfully!")
        log("Will ID: ".concat(lastTxId.toString()))
        log("Beneficiary: ".concat(beneficiaryAddress.toString()))
        log("Percentage: ".concat(percentage.toString()).concat("%"))
        log("Inactivity Duration: ".concat(inactivityDuration.toString()).concat(" seconds"))
    }
}
