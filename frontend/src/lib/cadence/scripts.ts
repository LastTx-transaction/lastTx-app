// Cadence scripts for reading data from the blockchain

export const GET_ACCOUNT_SETUP = `
import LastTx from 0xLastTx

access(all) fun main(account: Address): Bool {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    return cap.check()
}
`;

export const GET_LASTTX_IDS = `
import LastTx from 0xLastTx

access(all) fun main(account: Address): [UInt64] {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        return collection.getLastTxIDs()
    }
    return []
}
`;

export const GET_LASTTX_DETAILS = `
import LastTx from 0xLastTx

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
import LastTx from 0xLastTx

access(all) fun main(account: Address): {String: AnyStruct} {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        return collection.getDetails()
    }
    return {}
}
`;

export const GET_EXPIRED_LASTTX = `
import LastTx from 0xLastTx

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
import LastTx from 0xLastTx

access(all) fun main(): {String: AnyStruct} {
    return {
        "totalCreated": LastTx.getTotalLastTxCreated()
    }
}
`;

export const GET_ACCOUNT_BALANCE = `
import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken

access(all) fun main(account: Address): UFix64 {
    let vaultRef = getAccount(account)
        .capabilities.get<&FlowToken.Vault>(/public/flowTokenBalance)
        .borrow()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
`;
