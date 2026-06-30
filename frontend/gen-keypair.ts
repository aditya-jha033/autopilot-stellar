import { Keypair } from "@stellar/stellar-sdk";

const kp = Keypair.random();
console.log("AUTOPILOT_PUBLIC_KEY=" + kp.publicKey());
console.log("AUTOPILOT_SECRET_KEY=" + kp.secret());
 