#![no_std]

use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vault {
    pub id: u64,
    pub owner: Address,
    pub balance: i128,
    pub yield_earned: i128, // Mock for yield integration
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AutomationRule {
    pub id: u64,
    pub vault_id: u64,
    pub owner: Address,
    pub trigger: String, // e.g., "ON_PAYMENT_RECEIVED"
    pub action_type: String, // e.g., "TRANSFER" or "SWAP"
    pub amount: i128,
    pub is_percentage: bool,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    VaultCount,
    RuleCount,
    Vault(u64),
    Rule(u64),
    UserVaults(Address), // Map of user to their vault IDs
    UserRules(Address),  // Map of user to their rule IDs
}
