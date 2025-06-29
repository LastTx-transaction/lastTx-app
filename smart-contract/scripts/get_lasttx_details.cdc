// Script to get LastTx details

import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(accountAddress: Address, lastTxId: UInt64): {String: AnyStruct}? {
    // Get public reference to the account's LastTx collection
    let collectionRef = getAccount(accountAddress)
        .capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
        .borrow()
    
    if let collection = collectionRef {
        // Try to get the LastTx reference
        if let lastTxRef = collection.borrowLastTx(id: lastTxId) {
            return lastTxRef.getDetails()
        }
    }
    
    return nil
}
