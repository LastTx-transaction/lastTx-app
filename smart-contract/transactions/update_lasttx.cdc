/// Transaction to update LastTx inheritance will settings

import LastTx from 0xf8d6e0586b0a20c7

transaction(
    id: UInt64, 
    inactivityDuration: UFix64, 
    beneficiaryAddress: Address,
    beneficiaryPercentage: UFix64,
    beneficiaryName: String,
    personalMessage: String
) {
    
    prepare(signer: auth(BorrowValue) &Account) {
        let collectionRef = signer.storage.borrow<&LastTx.Collection>(from: LastTx.LastTxStoragePath)
            ?? panic("Could not borrow LastTx Collection from storage")
        
        let beneficiary = LastTx.createBeneficiary(
            address: beneficiaryAddress,
            percentage: beneficiaryPercentage,
            name: beneficiaryName == "" ? nil : beneficiaryName
        )
        let beneficiaries: [LastTx.Beneficiary] = [beneficiary]
        
        let success = collectionRef.updateLastTx(
            id: id,
            inactivityDuration: inactivityDuration,
            beneficiaries: beneficiaries,
            personalMessage: personalMessage == "" ? nil : personalMessage
        )
        
        if !success {
            panic("Failed to update LastTx with ID: ".concat(id.toString()))
        }
        
        log("LastTx inheritance will updated successfully")
    }
}
