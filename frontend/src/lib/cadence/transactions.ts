// Cadence transactions for modifying blockchain state

export const CREATE_WILL = `
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
        if signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath) == nil {
            signer.storage.save(<-LastTx.createEmptyCollection(), to: LastTx.LastTxStoragePath)
            
            let publicCap = signer.capabilities.storage.issue<&LastTx.Collection>(LastTx.LastTxStoragePath)
            signer.capabilities.publish(publicCap, at: LastTx.LastTxPublicPath)
        }
        
        self.collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)!
        
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
    }
}
`;

export const CLAIM_WILL = `
import LastTx from 0xf8d6e0586b0a20c7
import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

transaction(ownerAddress: Address, lastTxId: UInt64) {
    
    let beneficiaryVault: &FlowToken.Vault
    let lastTxCollection: &LastTx.Collection
    
    prepare(beneficiarySigner: auth(Storage) &Account) {
        self.beneficiaryVault = beneficiarySigner.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!
        
        let ownerAccount = getAccount(ownerAddress)
        self.lastTxCollection = ownerAccount.capabilities.borrow<&LastTx.Collection>(LastTx.LastTxPublicPath)!
    }
    
    execute {
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
`;

export const UPDATE_WILL = `
import LastTx from 0xf8d6e0586b0a20c7

transaction(
    id: UInt64, 
    inactivityDuration: UFix64, 
    beneficiaryAddress: Address,
    beneficiaryPercentage: UFix64,
    beneficiaryName: String,
    personalMessage: String
) {
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from storage")
        
        let beneficiary = LastTx.createBeneficiary(
            address: beneficiaryAddress,
            percentage: beneficiaryPercentage,
            name: beneficiaryName == "" ? nil : beneficiaryName
        )
        let beneficiaries: [LastTx.Beneficiary] = [beneficiary]
        
        let lastTxRef = collectionRef.borrowLastTx(id: id)
            ?? panic("Could not borrow LastTx reference")
        
        lastTxRef.updateLastTx(
            inactivityDuration: inactivityDuration,
            beneficiaries: beneficiaries,
            personalMessage: personalMessage == "" ? nil : personalMessage
        )
        
        log("LastTx updated successfully!")
    }
}
`;

export const DELETE_WILL = `
import LastTx from 0xf8d6e0586b0a20c7

transaction(id: UInt64) {
    let collection: &LastTx.Collection
    
    prepare(signer: auth(Storage) &Account) {
        self.collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from storage")
    }
    
    execute {
        self.collection.deleteLastTx(id: id)
        log("LastTx deleted successfully!")
    }
}
`;

export const SEND_ACTIVITY_PULSE = `
import LastTx from 0xf8d6e0586b0a20c7

transaction(lastTxId: UInt64) {
    let collectionRef: &LastTx.Collection
    
    prepare(signer: auth(Storage) &Account) {
        self.collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx collection from storage")
    }
    
    execute {
        let lastTxRef = self.collectionRef.borrowLastTx(id: lastTxId)
            ?? panic("Could not borrow LastTx reference")
        
        lastTxRef.sendActivityPulse()
        
        log("Activity pulse sent successfully for LastTx ID: ".concat(lastTxId.toString()))
    }
}
`;
