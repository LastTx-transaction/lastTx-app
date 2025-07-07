/// Script to get all LastTx inheritance wills for an account

import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(accountAddress: Address): {String: AnyStruct} {
    let collectionRef = getAccount(accountAddress)
        .capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
        .borrow()
    
    if let collection = collectionRef {
        let ids = collection.getLastTxIDs()
        let result: {String: AnyStruct} = {}
        
        for id in ids {
            if let lastTx = collection.borrowLastTx(id: id) {
                let details = lastTx.getDetails()
                result[id.toString()] = details
            }
        }
        
        return result
    }
    
    return {}
}
