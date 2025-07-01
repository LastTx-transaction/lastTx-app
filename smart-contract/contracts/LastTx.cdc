import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

/// NonCustodial inheritance contract with percentage-based distribution
access(all) contract LastTx {
    
    /// Events
    access(all) event LastTxCreated(owner: Address, beneficiary: Address, percentage: UFix64, lastTxId: UInt64, personalMessage: String?)
    access(all) event LastTxClaimed(owner: Address, beneficiary: Address, amount: UFix64, lastTxId: UInt64)
    access(all) event ActivityPulse(owner: Address, lastTxId: UInt64, timestamp: UFix64)
    access(all) event LastTxUpdated(owner: Address, lastTxId: UInt64)
    access(all) event LastTxDeleted(owner: Address, lastTxId: UInt64)
    
    /// Storage and public paths
    access(all) let LastTxStoragePath: StoragePath
    access(all) let LastTxPublicPath: PublicPath
    
    /// Global counter for LastTx IDs
    access(all) var nextLastTxId: UInt64
    
    /// Beneficiary information struct
    access(all) struct Beneficiary {
        access(all) let address: Address
        access(all) let percentage: UFix64
        access(all) let name: String?
        
        init(address: Address, percentage: UFix64, name: String?) {
            self.address = address
            self.percentage = percentage
            self.name = name
        }
    }
    
    /// LastTx instance with vault capability for inheritance distribution
    access(all) resource LastTxInstance {
        access(all) let id: UInt64
        access(all) let ownerAddress: Address
        access(all) var beneficiaries: [Beneficiary]
        access(all) var personalMessage: String?
        access(all) var inactivityDuration: UFix64
        access(all) let createdAt: UFix64
        access(all) var lastActivity: UFix64
        access(all) let vaultCapability: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
        access(all) var isClaimed: Bool
        access(all) var isActive: Bool
        
        init(
            owner: Address,
            beneficiaries: [Beneficiary], 
            personalMessage: String?,
            inactivityDuration: UFix64,
            vaultCapability: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
        ) {
            self.id = LastTx.nextLastTxId
            LastTx.nextLastTxId = LastTx.nextLastTxId + 1
            
            self.ownerAddress = owner
            self.beneficiaries = beneficiaries
            self.personalMessage = personalMessage
            self.inactivityDuration = inactivityDuration
            self.createdAt = getCurrentBlock().timestamp
            self.lastActivity = getCurrentBlock().timestamp
            self.vaultCapability = vaultCapability
            self.isClaimed = false
            self.isActive = true
            
            // Emit event for first beneficiary (for simplicity)
            if beneficiaries.length > 0 {
                emit LastTxCreated(
                    owner: owner, 
                    beneficiary: beneficiaries[0].address, 
                    percentage: beneficiaries[0].percentage, 
                    lastTxId: self.id,
                    personalMessage: personalMessage
                )
            }
        }
        
        /// Reset activity timer to prevent expiration
        access(all) fun sendActivityPulse() {
            self.lastActivity = getCurrentBlock().timestamp
            emit ActivityPulse(owner: self.ownerAddress, lastTxId: self.id, timestamp: self.lastActivity)
        }
        
        /// Update LastTx settings (only owner, only if not claimed)
        access(all) fun updateLastTx(
            inactivityDuration: UFix64?,
            beneficiaries: [Beneficiary]?,
            personalMessage: String?
        ): Bool {
            pre {
                !self.isClaimed: "Cannot update claimed LastTx"
                self.isActive: "Cannot update inactive LastTx"
            }
            
            // Update fields if provided
            if let newDuration = inactivityDuration {
                self.inactivityDuration = newDuration
            }
            
            if let newBeneficiaries = beneficiaries {
                self.beneficiaries = newBeneficiaries
            }
            
            if personalMessage != nil {
                self.personalMessage = personalMessage
            }
            
            // Reset activity timer when updating
            self.lastActivity = getCurrentBlock().timestamp
            
            emit LastTxUpdated(owner: self.ownerAddress, lastTxId: self.id)
            
            return true
        }
        
        /// Check if LastTx has expired due to inactivity
        access(all) fun isExpired(): Bool {
            let currentTime = getCurrentBlock().timestamp
            return (currentTime - self.lastActivity) >= self.inactivityDuration
        }
        
        /// Calculate remaining time before expiration
        access(all) fun getTimeRemaining(): UFix64 {
            let currentTime = getCurrentBlock().timestamp
            let timePassed = currentTime - self.lastActivity
            if timePassed >= self.inactivityDuration {
                return 0.0
            }
            return self.inactivityDuration - timePassed
        }
        
        /// Claim inheritance distribution by beneficiary
        access(all) fun claimInheritance(beneficiaryVault: &FlowToken.Vault): Bool {
            pre {
                !self.isClaimed: "Inheritance already claimed"
                self.vaultCapability.check(): "Owner vault capability is invalid"
            }
            
            // Check if expired
            if !self.isExpired() {
                return false
            }
            
            // Find beneficiary that matches vault owner (like SimpleClaim validation)
            var beneficiaryFound = false
            var percentage: UFix64 = 0.0
            
            for beneficiary in self.beneficiaries {
                if beneficiary.address == beneficiaryVault.owner!.address {
                    beneficiaryFound = true
                    percentage = beneficiary.percentage
                    break
                }
            }
            
            if !beneficiaryFound {
                return false
            }
            
            // Get owner vault untuk mengecek balance dan withdraw
            let ownerVault = self.vaultCapability.borrow()!
            
            // Calculate percentage of owner's current balance
            let ownerBalance = ownerVault.balance
            let claimAmount = ownerBalance * (percentage / 100.0)
            
            // Withdraw dari vault owner
            let claimVault <- ownerVault.withdraw(amount: claimAmount)
            
            // Deposit ke vault beneficiary
            beneficiaryVault.deposit(from: <-claimVault)
            
            // Mark as claimed
            self.isClaimed = true
            self.isActive = false
            
            emit LastTxClaimed(owner: self.ownerAddress, beneficiary: beneficiaryVault.owner!.address, amount: claimAmount, lastTxId: self.id)
            
            return true
        }
        
        access(all) view fun getDetails(): {String: AnyStruct} {
            let currentTime = getCurrentBlock().timestamp
            let timePassed = currentTime - self.lastActivity
            let isExpiredNow = timePassed >= self.inactivityDuration
            let timeRemainingNow = isExpiredNow ? 0.0 : self.inactivityDuration - timePassed
            
            return {
                "id": self.id,
                "owner": self.ownerAddress,
                "beneficiaries": self.beneficiaries,
                "personalMessage": self.personalMessage,
                "inactivityDuration": self.inactivityDuration,
                "createdAt": self.createdAt,
                "lastActivity": self.lastActivity,
                "isClaimed": self.isClaimed,
                "isActive": self.isActive,
                "isExpired": isExpiredNow,
                "timeRemaining": timeRemainingNow,
                "balance": self.vaultCapability.borrow()?.balance ?? 0.0
            }
        }
    }
    
    // Public interface for LastTxInstance
    access(all) resource interface LastTxInstancePublic {
        access(all) view fun getDetails(): {String: AnyStruct}
        access(all) fun isExpired(): Bool
        access(all) fun getTimeRemaining(): UFix64
        access(all) fun claimInheritance(beneficiaryVault: &FlowToken.Vault): Bool
    }
    
    /// Collection to store and manage multiple LastTx instances
    access(all) resource Collection {
        access(all) var lastTxs: @{UInt64: LastTxInstance}
        
        init() {
            self.lastTxs <- {}
        }
        
        /// Create new LastTx inheritance will
        access(all) fun createLastTx(
            inactivityDuration: UFix64,
            beneficiaries: [Beneficiary],
            personalMessage: String?,
            vaultCapability: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
        ): UInt64 {
            let lastTx <- create LastTxInstance(
                owner: self.owner!.address,
                beneficiaries: beneficiaries,
                personalMessage: personalMessage,
                inactivityDuration: inactivityDuration,
                vaultCapability: vaultCapability
            )
            
            let lastTxId = lastTx.id
            self.lastTxs[lastTxId] <-! lastTx
            
            return lastTxId
        }
        
        /// Get reference to specific LastTx instance
        access(all) fun borrowLastTx(id: UInt64): &LastTxInstance? {
            return &self.lastTxs[id] as &LastTxInstance?
        }
        
        /// Get all LastTx IDs owned by this account
        access(all) fun getLastTxIDs(): [UInt64] {
            return self.lastTxs.keys
        }
        
        /// Send activity pulse to specific LastTx to reset timer
        access(all) fun sendActivityPulse(id: UInt64) {
            if let lastTxRef = &self.lastTxs[id] as &LastTxInstance? {
                lastTxRef.sendActivityPulse()
            }
        }
        
        /// Delete LastTx instance (cannot delete claimed wills)
        access(all) fun deleteLastTx(id: UInt64): Bool {
            pre {
                self.lastTxs.containsKey(id): "LastTx not found"
            }
            
            if let lastTxRef = &self.lastTxs[id] as &LastTxInstance? {
                if lastTxRef.isClaimed {
                    return false
                }
            }
            
            destroy self.lastTxs.remove(key: id)
            emit LastTxDeleted(owner: self.owner!.address, lastTxId: id)
            return true
        }
        
        /// Update LastTx settings
        access(all) fun updateLastTx(
            id: UInt64,
            inactivityDuration: UFix64?,
            beneficiaries: [Beneficiary]?,
            personalMessage: String?
        ): Bool {
            pre {
                self.lastTxs.containsKey(id): "LastTx not found"
            }
            
            let lastTxRef = &self.lastTxs[id] as &LastTxInstance?
            if lastTxRef == nil {
                return false
            }
            
            return lastTxRef!.updateLastTx(
                inactivityDuration: inactivityDuration,
                beneficiaries: beneficiaries,
                personalMessage: personalMessage
            )
        }
        
        /// Claim inheritance distribution for beneficiary
        access(all) fun claimInheritance(id: UInt64, beneficiaryVault: &FlowToken.Vault): Bool {
            pre {
                self.lastTxs.containsKey(id): "LastTx not found"
            }
            
            let lastTxRef = &self.lastTxs[id] as &LastTxInstance?
            if lastTxRef == nil {
                return false
            }
            
            return lastTxRef!.claimInheritance(beneficiaryVault: beneficiaryVault)
        }
    }
    
    /// Public interface for Collection
    access(all) resource interface CollectionPublic {
        access(all) fun borrowLastTx(id: UInt64): &LastTxInstance?
        access(all) fun getLastTxIDs(): [UInt64]
        access(all) fun claimInheritance(id: UInt64, beneficiaryVault: &FlowToken.Vault): Bool
    }
    
    /// Create empty collection for LastTx instances
    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }
    
    /// Create beneficiary struct with validation
    access(all) fun createBeneficiary(address: Address, percentage: UFix64, name: String?): Beneficiary {
        return Beneficiary(address: address, percentage: percentage, name: name)
    }
    
    /// Get total number of LastTx instances created
    access(all) fun getTotalLastTxCreated(): UInt64 {
        return self.nextLastTxId
    }
    
    init() {
        self.nextLastTxId = 1
        
        self.LastTxStoragePath = /storage/LastTxCollection
        self.LastTxPublicPath = /public/LastTxCollection
    }
}
