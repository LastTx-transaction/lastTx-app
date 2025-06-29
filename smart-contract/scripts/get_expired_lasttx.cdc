// Script to get expired LastTx that need distribution

import LastTx from 0xf8d6e0586b0a20c7

access(all) struct ExpiredLastTx {
    access(all) let ownerAddress: Address
    access(all) let id: UInt64
    access(all) let name: String?
    access(all) let balance: UFix64
    access(all) let beneficiariesCount: Int
    access(all) let expiredSince: UFix64
    
    init(
        ownerAddress: Address,
        id: UInt64,
        name: String?,
        balance: UFix64,
        beneficiariesCount: Int,
        expiredSince: UFix64
    ) {
        self.ownerAddress = ownerAddress
        self.id = id
        self.name = name
        self.balance = balance
        self.beneficiariesCount = beneficiariesCount
        self.expiredSince = expiredSince
    }
}

access(all) fun main(accountAddress: Address): [ExpiredLastTx] {
    let expiredLastTxs: [ExpiredLastTx] = []
    
    // Get public reference to the account's LastTx collection
    let collectionRef = getAccount(accountAddress)
        .capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
        .borrow()
    
    if let collection = collectionRef {
        let ids = collection.getLastTxIDs()
        
        for id in ids {
            if let lastTxRef = collection.borrowLastTx(id: id) {
                let details = lastTxRef.getDetails()
                let isExpired = details["isExpired"] as! Bool? ?? false
                let balance = details["balance"] as! UFix64? ?? 0.0
                
                // Only include expired LastTx with funds available for distribution
                if isExpired && balance > 0.0 {
                    let lastActivity = details["lastActivity"] as! UFix64? ?? 0.0
                    let inactivityDuration = details["inactivityDuration"] as! UFix64? ?? 0.0
                    let expiredSince = getCurrentBlock().timestamp - (lastActivity + inactivityDuration)
                    
                    let expiredLastTx = ExpiredLastTx(
                        ownerAddress: accountAddress,
                        id: id,
                        name: details["name"] as! String?,
                        balance: balance,
                        beneficiariesCount: (details["beneficiaries"] as! [AnyStruct]?)?.length ?? 0,
                        expiredSince: expiredSince
                    )
                    
                    expiredLastTxs.append(expiredLastTx)
                }
            }
        }
    }
    
    return expiredLastTxs
}
