// Transaction to send activity pulse and reset timer

import LastTx from 0xf8d6e0586b0a20c7

transaction(lastTxId: UInt64) {
    let collectionRef: &LastTx.Collection
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to LastTx collection
        self.collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx collection from storage")
    }
    
    execute {
        // Get reference to the LastTx
        let lastTxRef = self.collectionRef.borrowLastTx(id: lastTxId)
            ?? panic("Could not borrow LastTx reference")
        
        // Send activity pulse
        lastTxRef.sendActivityPulse()
        
        log("Activity pulse sent successfully for LastTx ID: ".concat(lastTxId.toString()))
        log("Timer has been reset. Stay active to keep your LastTx running!")
    }
}
