// Cadence transactions for blockchain write operations

export const SETUP_ACCOUNT = `
import LastTx from 0xLastTx

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if collection already exists
        if signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath) == nil {
            // Create and store collection
            let collection <- LastTx.createEmptyCollection()
            signer.storage.save(<-collection, to: LastTx.LastTxStoragePath)
            
            // Create public capability
            let cap = signer.capabilities.storage.issue<&LastTx.Collection>(LastTx.LastTxStoragePath)
            signer.capabilities.publish(cap, at: LastTx.LastTxPublicPath)
        }
    }
}
`;

export const CREATE_LASTTX = `
import LastTx from 0xLastTx

transaction(
    inactivityDuration: UFix64,
    beneficiaryAddresses: [Address],
    beneficiaryPercentages: [UFix64],
    beneficiaryNames: [String?],
    personalMessage: String?
) {
    prepare(signer: auth(Storage) &Account) {
        // Get collection reference
        let collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from signer")
        
        // Create beneficiaries array
        let beneficiaries: [LastTx.Beneficiary] = []
        var i = 0
        while i < beneficiaryAddresses.length {
            let beneficiary = LastTx.createBeneficiary(
                address: beneficiaryAddresses[i],
                percentage: beneficiaryPercentages[i],
                name: beneficiaryNames[i]
            )
            beneficiaries.append(beneficiary)
            i = i + 1
        }
        
        // Create LastTx
        let id = collection.createLastTx(
            owner: signer.address,
            inactivityDuration: inactivityDuration,
            beneficiaries: beneficiaries,
            personalMessage: personalMessage
        )
        
        log("LastTx created with ID: ".concat(id.toString()))
    }
}
`;

export const SEND_ACTIVITY_PULSE = `
import LastTx from 0xLastTx

transaction(id: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        // Get collection reference
        let collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from signer")
        
        // Get LastTx reference
        let lastTx = collection.borrowLastTx(id: id)
            ?? panic("Could not borrow LastTx with ID: ".concat(id.toString()))
        
        // Send activity pulse
        lastTx.sendActivityPulse()
        
        log("Activity pulse sent for LastTx ID: ".concat(id.toString()))
    }
}
`;

export const DEPOSIT_FUNDS = `
import LastTx from 0xLastTx
import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken

transaction(id: UInt64, amount: UFix64) {
    let sentVault: @{FungibleToken.Vault}
    
    prepare(signer: auth(Storage) &Account) {
        // Get the signer's stored vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        // Get the recipient's public account object
        let recipient = getAccount(0xLastTx)

        // Get a reference to the recipient's LastTx collection
        let collectionRef = recipient.capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
            .borrow()
            ?? panic("Could not borrow receiver reference to the recipient's LastTx Collection")

        // Get LastTx reference
        let lastTx = collectionRef.borrowLastTx(id: id)
            ?? panic("Could not borrow LastTx with ID: ".concat(id.toString()))

        // Deposit the withdrawn tokens in the LastTx
        lastTx.deposit(from: <-self.sentVault)
        
        log("Deposited ".concat(amount.toString()).concat(" tokens to LastTx ID: ").concat(id.toString()))
    }
}
`;

export const DISTRIBUTE_FUNDS = `
import LastTx from 0xLastTx
import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken

transaction(id: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        // Get collection reference
        let collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from signer")
        
        // Get LastTx reference
        let lastTx = collection.borrowLastTx(id: id)
            ?? panic("Could not borrow LastTx with ID: ".concat(id.toString()))
        
        // Check if expired
        if !lastTx.isExpired() {
            panic("LastTx is not expired yet")
        }
        
        // Get beneficiaries and distribute
        let details = lastTx.getDetails()
        let beneficiaries = details["beneficiaries"]! as! [LastTx.Beneficiary]
        let distributions <- lastTx.distributeFunds()
        
        // Send funds to each beneficiary
        var i = 0
        while i < beneficiaries.length {
            let beneficiary = beneficiaries[i]
            let beneficiaryAccount = getAccount(beneficiary.address)
            
            // Get receiver reference
            let receiverRef = beneficiaryAccount.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                .borrow()
                ?? panic("Could not borrow receiver reference to the recipient's Vault")
            
            // Deposit funds
            let vault <- distributions.removeFirst()
            receiverRef.deposit(from: <-vault)
            
            i = i + 1
        }
        
        // Destroy empty distributions array
        destroy distributions
        
        log("Funds distributed for LastTx ID: ".concat(id.toString()))
    }
}
`;

export const UPDATE_LASTTX = `
import LastTx from 0xLastTx

transaction(
    id: UInt64,
    inactivityDuration: UFix64,
    beneficiaryAddresses: [Address],
    beneficiaryPercentages: [UFix64],
    beneficiaryNames: [String?],
    personalMessage: String?
) {
    prepare(signer: auth(Storage) &Account) {
        // Get collection reference
        let collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from signer")
        
        // Create beneficiaries array
        let beneficiaries: [LastTx.Beneficiary] = []
        var i = 0
        while i < beneficiaryAddresses.length {
            let beneficiary = LastTx.createBeneficiary(
                address: beneficiaryAddresses[i],
                percentage: beneficiaryPercentages[i],
                name: beneficiaryNames[i]
            )
            beneficiaries.append(beneficiary)
            i = i + 1
        }
        
        // Update the LastTx
        let success = collection.updateLastTx(
            id: id,
            inactivityDuration: inactivityDuration,
            beneficiaries: beneficiaries,
            personalMessage: personalMessage
        )
        
        if !success {
            panic("Failed to update LastTx with ID: ".concat(id.toString()))
        }
        
        log("LastTx updated successfully with ID: ".concat(id.toString()))
    }
}
`;

export const DELETE_LASTTX = `
import LastTx from 0xLastTx

transaction(id: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        // Get collection reference
        let collection = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from signer")
        
        // Delete the LastTx
        let success = collection.deleteLastTx(id: id)
        
        if !success {
            panic("Failed to delete LastTx with ID: ".concat(id.toString()))
        }
        
        log("LastTx deleted successfully with ID: ".concat(id.toString()))
    }
}
`;
