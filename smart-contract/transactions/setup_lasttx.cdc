// Transaction to setup LastTx collection for a user account

import LastTx from 0xf8d6e0586b0a20c7

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if the account already has a LastTx collection
        if signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath) == nil {
            // Create a new LastTx collection and save it to storage
            let collection <- LastTx.createEmptyCollection()
            signer.storage.save(<-collection, to: LastTx.LastTxStoragePath)
            
            // Create and publish the public capability
            let cap = signer.capabilities.storage.issue<&LastTx.Collection>(LastTx.LastTxStoragePath)
            signer.capabilities.publish(cap, at: LastTx.LastTxPublicPath)
            
            log("LastTx collection created and linked successfully")
        } else {
            log("LastTx collection already exists")
        }
    }
    
    execute {
        log("Setup LastTx transaction completed")
    }
}
