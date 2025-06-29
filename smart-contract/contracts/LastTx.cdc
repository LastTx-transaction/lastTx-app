import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79

access(all) contract LastTx {
    
    // Events
    access(all) event LastTxCreated(owner: Address, id: UInt64)
    access(all) event ActivityPulse(owner: Address, id: UInt64, timestamp: UFix64)
    access(all) event FundsDistributed(id: UInt64, totalAmount: UFix64)
    access(all) event LastTxActivated(id: UInt64, owner: Address)
    
    // Storage paths
    access(all) let LastTxStoragePath: StoragePath
    access(all) let LastTxPublicPath: PublicPath
    
    // Total number of LastTx created
    access(all) var totalLastTxCreated: UInt64
    
    // Beneficiary structure
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
    
    // LastTx resource
    access(all) resource LastTxInstance {
        access(all) let id: UInt64
        access(all) let ownerAddress: Address
        access(all) var lastActivity: UFix64
        access(all) var inactivityDuration: UFix64
        access(all) var beneficiaries: [Beneficiary]
        access(all) let vault: @FlowToken.Vault
        access(all) var isActive: Bool
        access(all) let createdAt: UFix64
        access(all) var personalMessage: String?
        
        init(owner: Address, inactivityDuration: UFix64, beneficiaries: [Beneficiary], personalMessage: String?) {
            self.id = self.uuid
            self.ownerAddress = owner
            self.lastActivity = getCurrentBlock().timestamp
            self.inactivityDuration = inactivityDuration
            self.beneficiaries = beneficiaries
            self.vault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as! @FlowToken.Vault
            self.isActive = true
            self.createdAt = getCurrentBlock().timestamp
            self.personalMessage = personalMessage
            
            LastTx.totalLastTxCreated = LastTx.totalLastTxCreated + 1
            emit LastTxCreated(owner: owner, id: self.id)
        }
        
        access(all) fun sendActivityPulse() {
            self.lastActivity = getCurrentBlock().timestamp
            emit ActivityPulse(owner: self.ownerAddress, id: self.id, timestamp: self.lastActivity)
        }
        
        access(all) fun updateSettings(inactivityDuration: UFix64, beneficiaries: [Beneficiary], personalMessage: String?) {
            self.inactivityDuration = inactivityDuration
            self.beneficiaries = beneficiaries
            self.personalMessage = personalMessage
            // Reset activity timer when settings are updated
            self.lastActivity = getCurrentBlock().timestamp
        }
        
        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            self.vault.deposit(from: <-from)
        }
        
        access(all) fun isExpired(): Bool {
            if !self.isActive {
                return true
            }
            let currentTime = getCurrentBlock().timestamp
            return (currentTime - self.lastActivity) >= self.inactivityDuration
        }
        
        access(all) fun getTimeRemaining(): UFix64 {
            if !self.isActive {
                return 0.0
            }
            let currentTime = getCurrentBlock().timestamp
            let elapsed = currentTime - self.lastActivity
            return elapsed >= self.inactivityDuration ? 0.0 : self.inactivityDuration - elapsed
        }
        
        access(all) fun distributeFunds(): @[{FungibleToken.Vault}] {
            let totalBalance = self.vault.balance
            let distributions: @[{FungibleToken.Vault}] <- []
            
            for beneficiary in self.beneficiaries {
                let amount = totalBalance * beneficiary.percentage / 100.0
                let distribution <- self.vault.withdraw(amount: amount)
                distributions.append(<-distribution)
            }
            
            self.isActive = false
            emit FundsDistributed(id: self.id, totalAmount: totalBalance)
            return <-distributions
        }
        
        access(all) fun getDetails(): {String: AnyStruct} {
            return {
                "id": self.id,
                "owner": self.ownerAddress,
                "personalMessage": self.personalMessage,
                "lastActivity": self.lastActivity,
                "inactivityDuration": self.inactivityDuration,
                "beneficiaries": self.beneficiaries,
                "balance": self.vault.balance,
                "isExpired": self.isExpired(),
                "isActive": self.isActive,
                "createdAt": self.createdAt,
                "timeRemaining": self.getTimeRemaining()
            }
        }
    }
    
    // Public interface
    access(all) resource interface LastTxPublic {
        access(all) fun getDetails(): {String: AnyStruct}
        access(all) fun isExpired(): Bool
        access(all) fun getTimeRemaining(): UFix64
    }
    
    // Collection resource
    access(all) resource Collection: LastTxPublic {
        access(all) var lastTxs: @{UInt64: LastTxInstance}
        
        init() {
            self.lastTxs <- {}
        }
        
        access(all) fun createLastTx(
            owner: Address,
            inactivityDuration: UFix64,
            beneficiaries: [Beneficiary],
            personalMessage: String?
        ): UInt64 {
            let lastTx <- create LastTxInstance(
                owner: owner,
                inactivityDuration: inactivityDuration,
                beneficiaries: beneficiaries,
                personalMessage: personalMessage
            )
            let id = lastTx.id
            self.lastTxs[id] <-! lastTx
            return id
        }
        
        access(all) fun borrowLastTx(id: UInt64): &LastTxInstance? {
            return &self.lastTxs[id] as &LastTxInstance?
        }
        
        access(all) fun updateLastTx(
            id: UInt64,
            inactivityDuration: UFix64,
            beneficiaries: [Beneficiary],
            personalMessage: String?
        ): Bool {
            if let lastTx = &self.lastTxs[id] as &LastTxInstance? {
                lastTx.updateSettings(inactivityDuration: inactivityDuration, beneficiaries: beneficiaries, personalMessage: personalMessage)
                return true
            }
            return false
        }
        
        access(all) fun deleteLastTx(id: UInt64): Bool {
            // Check if LastTx exists
            if self.lastTxs[id] == nil {
                return false
            }
            
            // Get reference to check if it has funds
            if let lastTx = &self.lastTxs[id] as &LastTxInstance? {
                // Prevent deletion if there are funds in the vault
                if lastTx.vault.balance > 0.0 {
                    panic("Cannot delete LastTx with funds. Please distribute or withdraw funds first.")
                }
            }
            
            // Remove and destroy the LastTx
            let oldLastTx <- self.lastTxs.remove(key: id)!
            destroy oldLastTx
            
            return true
        }
        
        access(all) fun getLastTxIDs(): [UInt64] {
            return self.lastTxs.keys
        }
        
        access(all) fun getDetails(): {String: AnyStruct} {
            let details: {String: AnyStruct} = {}
            for id in self.lastTxs.keys {
                if let lastTx = &self.lastTxs[id] as &LastTxInstance? {
                    details[id.toString()] = lastTx.getDetails()
                }
            }
            return details
        }
        
        access(all) fun isExpired(): Bool {
            for id in self.lastTxs.keys {
                if let lastTx = &self.lastTxs[id] as &LastTxInstance? {
                    if lastTx.isExpired() {
                        return true
                    }
                }
            }
            return false
        }
        
        access(all) fun getTimeRemaining(): UFix64 {
            var shortestTime: UFix64 = 999999999.0
            var hasActive = false
            
            for id in self.lastTxs.keys {
                if let lastTx = &self.lastTxs[id] as &LastTxInstance? {
                    if lastTx.isActive {
                        hasActive = true
                        let remaining = lastTx.getTimeRemaining()
                        if remaining < shortestTime {
                            shortestTime = remaining
                        }
                    }
                }
            }
            
            return hasActive ? shortestTime : 0.0
        }
    }
    
    // Create empty Collection
    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }
    
    // Create Beneficiary
    access(all) fun createBeneficiary(address: Address, percentage: UFix64, name: String?): Beneficiary {
        return Beneficiary(address: address, percentage: percentage, name: name)
    }
    
    // Get total created
    access(all) fun getTotalLastTxCreated(): UInt64 {
        return self.totalLastTxCreated
    }
    
    init() {
        // Set storage paths
        self.LastTxStoragePath = /storage/LastTxCollection
        self.LastTxPublicPath = /public/LastTxCollection
        
        // Initialize counter
        self.totalLastTxCreated = 0
        
        // Create and store empty collection
        let collection <- self.createEmptyCollection()
        self.account.storage.save(<-collection, to: self.LastTxStoragePath)
        
        // Create public capability
        let cap = self.account.capabilities.storage.issue<&Collection>(self.LastTxStoragePath)
        self.account.capabilities.publish(cap, at: self.LastTxPublicPath)
    }
}
