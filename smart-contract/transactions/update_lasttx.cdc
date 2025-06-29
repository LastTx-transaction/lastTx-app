import LastTx from 0xf8d6e0586b0a20c7

transaction(
    id: UInt64, 
    inactivityDuration: UFix64, 
    beneficiaryAddresses: [Address],
    beneficiaryPercentages: [UFix64],
    beneficiaryNames: [String?],
    personalMessage: String?
) {
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Get reference to the signer's LastTx Collection
        let collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from storage")
        
        // Validate input arrays have same length
        assert(
            beneficiaryAddresses.length == beneficiaryPercentages.length &&
            beneficiaryAddresses.length == beneficiaryNames.length,
            message: "All beneficiary arrays must have the same length"
        )
        
        // Create beneficiaries array
        let beneficiaries: [LastTx.Beneficiary] = []
        var i = 0
        while i < beneficiaryAddresses.length {
            let beneficiary = LastTx.createBeneficiary(
                address: beneficiaryAddresses[i],
                percentage: beneficiaryPercentages[i],
                name: beneficiaryNames[i]
            )
            beneficiaries.append(beneficiary)
            i = i + 1
        }
        
        // Update the LastTx
        let success = collectionRef.updateLastTx(
            id: id,
            inactivityDuration: inactivityDuration,
            beneficiaries: beneficiaries,
            personalMessage: personalMessage
        )
        
        if !success {
            panic("Failed to update LastTx with ID: ".concat(id.toString()))
        }
        
        log("LastTx updated successfully")
    }
}
