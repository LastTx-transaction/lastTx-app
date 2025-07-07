/// Script to get specific LastTx inheritance will details

import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(accountAddress: Address, lastTxId: UInt64): {String: AnyStruct}? {
    let collectionRef = getAccount(accountAddress)
        .capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
        .borrow()
    
    if let collection = collectionRef {
        if let lastTxRef = collection.borrowLastTx(id: lastTxId) {
            return lastTxRef.getDetails()
        }
    }
    
    return nil
}
