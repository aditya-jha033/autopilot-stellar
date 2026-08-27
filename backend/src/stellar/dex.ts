import { Asset, Operation, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import { getHorizon } from "./horizon";
import { getEngineKeypair } from "../lib/engine";

export async function executeDcaSwap(
  destinationId: string,
  amountXlmToSell: string,
  destAssetCode: string,
  destAssetIssuer: string
): Promise<string> {
  const engineKeypair = getEngineKeypair();
  const engineAccount = await getHorizon().loadAccount(engineKeypair.publicKey());

  const destAsset = new Asset(destAssetCode, destAssetIssuer);
  const nativeAsset = Asset.native();

  // pathPaymentStrictSend sells an exact amount of the sending asset
  // and receives at least destMin of the destination asset, sending it to the destinationId.
  const swapOp = Operation.pathPaymentStrictSend({
    sendAsset: nativeAsset,
    sendAmount: amountXlmToSell,
    destination: destinationId,
    destAsset: destAsset,
    destMin: "0", // Accept any market price (in a real app, calculate slippage)
    path: []
  });

  const tx = new TransactionBuilder(engineAccount, {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(swapOp)
    .setTimeout(30)
    .build();

  tx.sign(engineKeypair);

  const response = await getHorizon().submitTransaction(tx);
  return response.hash;
}


