/// Transaction to delete LastTx inheritance will

import LastTx from 0xf8d6e0586b0a20c7

transaction(id: UInt64) {
    let collectionRef: &LastTx.Collection
    
    prepare(signer: auth(Storage) &Account) {
        self.collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx collection from storage")
    }
    
    execute {
        let success = self.collectionRef.deleteLastTx(id: id)
        
        if !success {
            panic("Failed to delete LastTx with ID: ".concat(id.toString()).concat(" (may be already claimed)"))
        }
        
        log("LastTx inheritance will deleted successfully with ID: ".concat(id.toString()))
    }
}
