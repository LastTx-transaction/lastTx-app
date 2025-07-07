// Cadence transactions for modifying blockchain state
import { getContractAddress } from '../flow-config';

// Helper function to replace contract addresses in transactions
export const replaceContractAddresses = (transaction: string): string => {
  return transaction
    .replace(/0xLastTx/g, getContractAddress('LastTx'))
    .replace(/0xFungibleToken/g, getContractAddress('FungibleToken'))
    .replace(/0xFlowToken/g, getContractAddress('FlowToken'));
};

// Raw transactions with placeholder addresses
const CREATE_WILL_RAW = `
import LastTx from 0xLastTx
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

transaction(
    beneficiaryAddress: Address, 
    percentage: UFix64,
    inactivityDuration: UFix64,
    beneficiaryName: String,
    beneficiaryEmail: String,
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
            name: beneficiaryName == "" ? nil : beneficiaryName,
            email: beneficiaryEmail == "" ? nil : beneficiaryEmail
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

const CLAIM_WILL_RAW = `
import LastTx from 0xLastTx
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

transaction(ownerAddress: Address, lastTxId: UInt64) {
    let beneficiaryVaultCapability: Capability<&FlowToken.Vault>
    let lastTxCollection: &LastTx.Collection
    
    prepare(beneficiarySigner: auth(Storage, Capabilities) &Account) {
        /// Issue capability for beneficiary's vault to ensure owner reference
        self.beneficiaryVaultCapability = beneficiarySigner.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault)
        
        /// Get reference to owner's LastTx collection
        let ownerAccount = getAccount(ownerAddress)
        self.lastTxCollection = ownerAccount.capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
            .borrow() ?? panic("Could not borrow LastTx Collection from owner account")
    }
    
    execute {
        /// Borrow vault from capability to ensure owner reference is available
        let beneficiaryVault = self.beneficiaryVaultCapability.borrow()
            ?? panic("Could not borrow FlowToken Vault from capability")
        
        /// Execute inheritance claim
        let success = self.lastTxCollection.claimInheritance(
            id: lastTxId,
            beneficiaryVault: beneficiaryVault
        )
        
        if success {
            log("Inheritance claimed successfully!")
        } else {
            log("Inheritance claim failed!")
        }
    }
}
`;

const UPDATE_WILL_RAW = `
import LastTx from 0xLastTx

transaction(
    id: UInt64, 
    inactivityDuration: UFix64, 
    beneficiaryAddress: Address,
    beneficiaryPercentage: UFix64,
    beneficiaryName: String,
    beneficiaryEmail: String,
    personalMessage: String
) {
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from storage")
        
        let beneficiary = LastTx.createBeneficiary(
            address: beneficiaryAddress,
            percentage: beneficiaryPercentage,
            name: beneficiaryName == "" ? nil : beneficiaryName,
            email: beneficiaryEmail == "" ? nil : beneficiaryEmail
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

const DELETE_WILL_RAW = `
import LastTx from 0xLastTx

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

const SEND_ACTIVITY_PULSE_RAW = `
import LastTx from 0xLastTx

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

const SETUP_USER_PROFILE_RAW = `
import LastTx from 0xLastTx

transaction(email: String?, name: String?) {
    let collection: &LastTx.Collection
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Ensure collection exists
        if signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath) == nil {
            signer.storage.save(<-LastTx.createEmptyCollection(), to: LastTx.LastTxStoragePath)
            
            let publicCap = signer.capabilities.storage.issue<&LastTx.Collection>(LastTx.LastTxStoragePath)
            signer.capabilities.publish(publicCap, at: LastTx.LastTxPublicPath)
        }
        
        self.collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)!
    }
    
    execute {
        self.collection.setUserProfile(
            email: email,
            name: name
        )
        
        log("User profile updated successfully")
    }
}
`;

// Export transactions with proper contract addresses
export const CREATE_WILL = replaceContractAddresses(CREATE_WILL_RAW);
export const CLAIM_WILL = replaceContractAddresses(CLAIM_WILL_RAW);
export const UPDATE_WILL = replaceContractAddresses(UPDATE_WILL_RAW);
export const DELETE_WILL = replaceContractAddresses(DELETE_WILL_RAW);
export const SEND_ACTIVITY_PULSE = replaceContractAddresses(
  SEND_ACTIVITY_PULSE_RAW,
);
export const SETUP_USER_PROFILE = replaceContractAddresses(
  SETUP_USER_PROFILE_RAW,
);
