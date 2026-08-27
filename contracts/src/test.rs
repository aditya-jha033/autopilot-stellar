#![cfg(test)]
extern crate std;

use soroban_sdk::{Env, Address, String, testutils::Address as _};
use crate::{AutopilotProtocol, AutopilotProtocolClient};

#[test]
fn test_protocol_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AutopilotProtocol);
    let client = AutopilotProtocolClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize protocol
    client.initialize(&admin);

    // Create a vault
    let vault_id = client.create_vault(&user);
    assert_eq!(vault_id, 1);

    // Create an automation rule
    let rule_id = client.create_rule(
        &user,
        &vault_id,
        &String::from_str(&env, "PAYMENT_RECEIVED"),
        &String::from_str(&env, "DEPOSIT"),
        &10, // 10%
        &true,
    );
    assert_eq!(rule_id, 1);

    // Execute the rule (mock incoming payment of 1000)
    client.execute_rule(&rule_id, &1000);

    // Check vault balance (should be 10% of 1000 = 100)
    let vault = client.get_vault(&vault_id);
    assert_eq!(vault.balance, 100);
}
