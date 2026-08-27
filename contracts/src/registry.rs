use soroban_sdk::{contract, contractimpl, Address, Env, Vec, String};
use crate::types::{DataKey, Vault, AutomationRule};

#[contract]
pub struct AutopilotProtocol;

#[contractimpl]
impl AutopilotProtocol {
    /// Initialize the protocol
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Protocol already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::VaultCount, &0u64);
        env.storage().instance().set(&DataKey::RuleCount, &0u64);
    }

    /// Create a new yield-bearing vault for a user
    pub fn create_vault(env: Env, owner: Address) -> u64 {
        owner.require_auth();

        let mut count: u64 = env.storage().instance().get(&DataKey::VaultCount).unwrap_or(0);
        count += 1;

        let vault = Vault {
            id: count,
            owner: owner.clone(),
            balance: 0,
            yield_earned: 0,
        };

        env.storage().persistent().set(&DataKey::Vault(count), &vault);
        env.storage().instance().set(&DataKey::VaultCount, &count);

        // Update user's vault list
        let mut user_vaults: Vec<u64> = env.storage().persistent().get(&DataKey::UserVaults(owner.clone())).unwrap_or_else(|| Vec::new(&env));
        user_vaults.push_back(count);
        env.storage().persistent().set(&DataKey::UserVaults(owner), &user_vaults);

        count
    }

    /// Deposit funds into a vault (simulates sending funds to Blend for yield)
    pub fn deposit(env: Env, vault_id: u64, amount: i128) {
        let mut vault: Vault = env.storage().persistent().get(&DataKey::Vault(vault_id)).expect("Vault not found");
        vault.owner.require_auth();

        // In a real implementation, this would transfer tokens via cross-contract call
        // and deposit them into Blend Protocol pool.
        
        vault.balance += amount;
        env.storage().persistent().set(&DataKey::Vault(vault_id), &vault);
    }

    /// Create an automation rule
    pub fn create_rule(
        env: Env, 
        owner: Address, 
        vault_id: u64, 
        trigger: String, 
        action_type: String, 
        amount: i128, 
        is_percentage: bool
    ) -> u64 {
        owner.require_auth();

        // Verify vault ownership
        let vault: Vault = env.storage().persistent().get(&DataKey::Vault(vault_id)).expect("Vault not found");
        if vault.owner != owner {
            panic!("Not vault owner");
        }

        let mut count: u64 = env.storage().instance().get(&DataKey::RuleCount).unwrap_or(0);
        count += 1;

        let rule = AutomationRule {
            id: count,
            vault_id,
            owner: owner.clone(),
            trigger,
            action_type,
            amount,
            is_percentage,
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Rule(count), &rule);
        env.storage().instance().set(&DataKey::RuleCount, &count);

        // Update user's rules list
        let mut user_rules: Vec<u64> = env.storage().persistent().get(&DataKey::UserRules(owner.clone())).unwrap_or_else(|| Vec::new(&env));
        user_rules.push_back(count);
        env.storage().persistent().set(&DataKey::UserRules(owner), &user_rules);

        count
    }

    /// Execute a rule (Keeper function)
    pub fn execute_rule(env: Env, rule_id: u64, payment_amount: i128) {
        // SECURITY: Only the official keeper (admin) can trigger rule executions
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Protocol not initialized");
        admin.require_auth();

        let rule: AutomationRule = env.storage().persistent().get(&DataKey::Rule(rule_id)).expect("Rule not found");
        
        if !rule.is_active {
            panic!("Rule is paused");
        }

        let mut vault: Vault = env.storage().persistent().get(&DataKey::Vault(rule.vault_id)).expect("Vault not found");

        // Calculate amount to process
        let process_amount = if rule.is_percentage {
            (payment_amount * rule.amount) / 100
        } else {
            rule.amount
        };

        // Simulated cross-contract execution (e.g., swapping on DEX, depositing to Blend)
        // For Phase 1, we just update the vault balance to reflect the automation processed it
        vault.balance += process_amount;

        env.storage().persistent().set(&DataKey::Vault(rule.vault_id), &vault);
    }
    
    // Getters
    pub fn get_vault(env: Env, vault_id: u64) -> Vault {
        env.storage().persistent().get(&DataKey::Vault(vault_id)).expect("Vault not found")
    }

    pub fn get_rule(env: Env, rule_id: u64) -> AutomationRule {
        env.storage().persistent().get(&DataKey::Rule(rule_id)).expect("Rule not found")
    }
}
