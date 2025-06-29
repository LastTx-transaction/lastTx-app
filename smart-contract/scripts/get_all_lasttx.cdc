// Script to get all LastTx details for an account

import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(accountAddress: Address): {String: AnyStruct} {
    // Get public reference to the account's LastTx collection
    let collectionRef = getAccount(accountAddress)
        .capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
        .borrow()
    
    if let collection = collectionRef {
        return collection.getDetails()
    }
    
    return {}
}
