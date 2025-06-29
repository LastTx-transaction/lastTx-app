// Script to get all LastTx IDs for an account

import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(accountAddress: Address): [UInt64] {
    // Get public reference to the account's LastTx collection
    let collectionRef = getAccount(accountAddress)
        .capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
        .borrow()
    
    if let collection = collectionRef {
        return collection.getLastTxIDs()
    }
    
    return []
}
