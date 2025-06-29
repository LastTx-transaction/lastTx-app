// Transaction to create a new LastTx

import LastTx from 0xf8d6e0586b0a20c7

transaction(
    inactivityDuration: UFix64,
    beneficiaryAddresses: [Address],
    beneficiaryPercentages: [UFix64],
    beneficiaryNames: [String?],
    personalMessage: String?
) {
    let collectionRef: &LastTx.Collection
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to LastTx collection
        self.collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx collection from storage")
    }
    
    execute {
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
        
        // Create new LastTx
        let lastTxId = self.collectionRef.createLastTx(
            owner: signer.address,
            inactivityDuration: inactivityDuration,
            beneficiaries: beneficiaries,
            personalMessage: personalMessage
        )
        
        log("LastTx created successfully with ID: ".concat(lastTxId.toString()))
        log("Inactivity Duration: ".concat(inactivityDuration.toString()).concat(" seconds"))
        log("Personal Message: ".concat(personalMessage ?? "None"))
    }
}
