// Cadence scripts for reading data from the blockchain

export const GET_ACCOUNT_SETUP = `
import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(account: Address): Bool {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    return cap.check()
}
`;

export const GET_LASTTX_IDS = `
import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(account: Address): [UInt64] {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        return collection.getLastTxIDs()
    }
    return []
}
`;

export const GET_LASTTX_DETAILS = `
import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(account: Address, id: UInt64): {String: AnyStruct}? {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        if let lastTx = collection.borrowLastTx(id: id) {
            return lastTx.getDetails()
        }
    }
    return nil
}
`;

export const GET_ALL_LASTTX = `
import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(account: Address): {String: AnyStruct} {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        return collection.getDetails()
    }
    return {}
}
`;

// Alias untuk compatibility dengan service yang sudah ada
export const GET_ALL_WILLS = `
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
`;

export const GET_WILL_DETAIL = `
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
`;

export const GET_EXPIRED_LASTTX = `
import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(account: Address): [UInt64] {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    let expiredIds: [UInt64] = []
    
    if let collection = cap.borrow() {
        let ids = collection.getLastTxIDs()
        for id in ids {
            if let lastTx = collection.borrowLastTx(id: id) {
                if lastTx.isExpired() {
                    expiredIds.append(id)
                }
            }
        }
    }
    return expiredIds
}
`;

export const GET_LASTTX_STATS = `
import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(): {String: AnyStruct} {
    return {
        "totalCreated": LastTx.getTotalLastTxCreated()
    }
}
`;

export const GET_ACCOUNT_BALANCE = `
import FlowToken from 0x0ae53cb6e3f42a79
import FungibleToken from 0xee82856bf20e2aa6

access(all) fun main(account: Address): UFix64 {
    let vaultRef = getAccount(account)
        .capabilities.get<&FlowToken.Vault>(/public/flowTokenBalance)
        .borrow()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
`;

export const GET_USER_PROFILE = `
import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    let cap = getAccount(userAddress).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        if let profile = collection.getUserProfile() {
            return {
                "owner": profile.owner,
                "email": profile.email,
                "name": profile.name,
                "createdAt": profile.createdAt,
                "updatedAt": profile.updatedAt
            }
        }
    }
    return nil
}
`;
