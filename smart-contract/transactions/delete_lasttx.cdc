// Transaction to delete a LastTx

import LastTx from 0xf8d6e0586b0a20c7

transaction(id: UInt64) {
    let collectionRef: &LastTx.Collection
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to LastTx collection
        self.collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx collection from storage")
    }
    
    execute {
        // Delete the LastTx
        let success = self.collectionRef.deleteLastTx(id: id)
        
        if !success {
            panic("Failed to delete LastTx with ID: ".concat(id.toString()))
        }
        
        log("LastTx deleted successfully with ID: ".concat(id.toString()))
    }
}
