import LastTx from 0xf8d6e0586b0a20c7

/// Transaction to set up user profile with email and name
transaction(email: String?, name: String?) {
    let collection: &LastTx.Collection
    
    prepare(owner: auth(Storage, Capabilities) &Account) {
        // Get reference to the LastTx collection
        self.collection = owner.storage.borrow<&LastTx.Collection>(
            from: LastTx.LastTxStoragePath
        ) ?? panic("LastTx collection not found")
    }
    
    execute {
        // Set or update user profile
        self.collection.setUserProfile(email: email, name: name)
        log("User profile updated successfully")
    }
}
