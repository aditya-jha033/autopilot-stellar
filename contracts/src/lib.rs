#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contract]
pub struct AutopilotVault;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Owner,
    Engine,
    IsInitialized,
}

#[contractimpl]
impl AutopilotVault {
    /// Initialize the vault with owner and engine addresses
    pub fn initialize(env: Env, owner: Address, engine: Address) {
        if env.storage().instance().has(&DataKey::IsInitialized) {
            panic!("Vault already initialized");
        }
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Engine, &engine);
        env.storage().instance().set(&DataKey::IsInitialized, &true);
    }

    /// Get the owner address
    pub fn get_owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).unwrap()
    }

    /// Get the engine address
    pub fn get_engine(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Engine).unwrap()
    }

    /// Withdraw funds - only the owner can withdraw
    pub fn withdraw(env: Env, amount: i128, token_address: Address) {
        // Retrieve owner
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        
        // Require the owner's cryptographic signature for this invocation
        owner.require_auth();

        // Transfer funds from contract to owner
        let client = token::Client::new(&env, &token_address);
        client.transfer(&env.current_contract_address(), &owner, &amount);
    }
}
