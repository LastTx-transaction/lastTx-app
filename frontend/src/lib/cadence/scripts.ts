// Cadence scripts for reading data from the blockchain
import { getContractAddress } from '../flow-config';

// Helper function to replace contract addresses in scripts
export const replaceContractAddresses = (script: string): string => {
  return script
    .replace(/0xLastTx/g, getContractAddress('LastTx'))
    .replace(/0xFungibleToken/g, getContractAddress('FungibleToken'))
    .replace(/0xFlowToken/g, getContractAddress('FlowToken'));
};

// Raw scripts with placeholder addresses
const GET_ACCOUNT_SETUP_RAW = `
import LastTx from 0xLastTx

access(all) fun main(account: Address): Bool {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    return cap.check()
}
`;

const GET_LASTTX_IDS_RAW = `
import LastTx from 0xLastTx

access(all) fun main(account: Address): [UInt64] {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        return collection.getLastTxIDs()
    }
    return []
}
`;

const GET_LASTTX_DETAILS_RAW = `
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

const GET_ALL_LASTTX_RAW = `
import LastTx from 0xLastTx

access(all) fun main(account: Address): {String: AnyStruct} {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    if let collection = cap.borrow() {
        return collection.getDetails()
    }
    return {}
}
`;

// Export scripts with proper contract addresses
export const GET_ACCOUNT_SETUP = replaceContractAddresses(
  GET_ACCOUNT_SETUP_RAW,
);
export const GET_LASTTX_IDS = replaceContractAddresses(GET_LASTTX_IDS_RAW);
export const GET_LASTTX_DETAILS = replaceContractAddresses(
  GET_LASTTX_DETAILS_RAW,
);
export const GET_ALL_LASTTX = replaceContractAddresses(GET_ALL_LASTTX_RAW);

// Alias untuk compatibility dengan service yang sudah ada
const GET_ALL_WILLS_RAW = `
import LastTx from 0xLastTx

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

const GET_WILL_DETAIL_RAW = `
import LastTx from 0xLastTx

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

const GET_EXPIRED_LASTTX_RAW = `
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

const GET_LASTTX_STATS_RAW = `
import LastTx from 0xLastTx

access(all) fun main(): {String: AnyStruct} {
    return {
        "totalCreated": LastTx.getTotalLastTxCreated()
    }
}
`;

const GET_ACCOUNT_BALANCE_RAW = `
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

const GET_USER_PROFILE_RAW = `
import LastTx from 0xLastTx

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

// Export scripts with proper contract addresses
export const GET_ALL_WILLS = replaceContractAddresses(GET_ALL_WILLS_RAW);
export const GET_WILL_DETAIL = replaceContractAddresses(GET_WILL_DETAIL_RAW);
export const GET_EXPIRED_LASTTX = replaceContractAddresses(
  GET_EXPIRED_LASTTX_RAW,
);
export const GET_LASTTX_STATS = replaceContractAddresses(GET_LASTTX_STATS_RAW);
export const GET_ACCOUNT_BALANCE = replaceContractAddresses(
  GET_ACCOUNT_BALANCE_RAW,
);
export const GET_USER_PROFILE = replaceContractAddresses(GET_USER_PROFILE_RAW);
