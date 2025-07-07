import LastTx from 0xf8d6e0586b0a20c7

/// Script to get user profile information
access(all) fun main(userAddress: Address): LastTx.UserProfile? {
    if let collection = getAccount(userAddress)
        .capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
        .borrow() {
        return collection.getUserProfile()
    }
    return nil
}
