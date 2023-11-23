import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RaijinContracts } from "../target/types/raijin_contracts";
import fs from "fs";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

import solana, { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { min } from "bn.js";

describe("raijin-contracts", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  
  const program = anchor.workspace.RaijinContracts as Program<RaijinContracts>;

  const userKP = new Keypair();
  console.log(`\n✅Created Authority Keypair : ${userKP.publicKey}.\n`)

  const userKPtransaction = await  anchor
  .getProvider()
  .connection.requestAirdrop(userKP.publicKey, 5 * LAMPORTS_PER_SOL);

  await anchor
  .getProvider()
  .connection.confirmTransaction(userKPtransaction);

  const paymentAccount = new Keypair();
  const paymentAccountPK = paymentAccount.publicKey
  console.log(`\n✅Created Authority Keypair : ${userKP.publicKey}.\n`)

  const paymentAccountPKtransaction = await  anchor
  .getProvider()
  .connection.requestAirdrop(paymentAccountPK, 5 * LAMPORTS_PER_SOL);

  await  anchor
  .getProvider()
  .connection.confirmTransaction(paymentAccountPKtransaction);
  
  const mint = new anchor.web3.PublicKey(
    "RJN7Y7Y8niBKKnQgMQK5zcCY8Hz5uE9sC1DXbZxSmkT"
  );

  it("Is initialized!", async () => {
    // TEST ACCOUNT:

    const userAta = await anchor
      .getProvider()
      .connection.getTokenAccountsByOwner(userKP.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

    const payementCollectorATA = await anchor
      .getProvider()
      .connection.getTokenAccountsByOwner(paymentAccountPK, {
        programId: TOKEN_PROGRAM_ID,
      });

    const userTokenBeforTransaction = await anchor
      .getProvider()
      .connection.getTokenAccountBalance(userAta.value[0].pubkey);

    const paymentTokenBeforTransaction = await anchor
      .getProvider()
      .connection.getTokenAccountBalance(payementCollectorATA.value[0].pubkey);

    console.log({
      payment: JSON.stringify(payementCollectorATA),
      user: JSON.stringify(userAta),
    });

    // Test Create Account Instruction
    const tx = await program.methods
      .createYearllySubscription()
      .accounts({
        user: userKP.publicKey,
        userAta: userAta.value[0].pubkey,
        paymentCollectorAta: payementCollectorATA.value[0].pubkey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([userKP])
      .rpc();

    const [account, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("subscription_data_account"),
        userKP.publicKey.toBytes(),
        Buffer.from("lfdfioeofbnooi"),
      ],
      program.programId
    );

    const userTokenAfterTransaction = await anchor
      .getProvider()
      .connection.getTokenAccountBalance(userAta.value[0].pubkey);

    const paymentTokenAfterTransaction = await anchor
      .getProvider()
      .connection.getTokenAccountBalance(payementCollectorATA.value[0].pubkey);

    const accountdata = await program.account.subscriptionAccountStruct.fetch(
      account
    );

    // console.log(`Data account ${JSON.stringify(accountdata)} ${accountdata.startDate.toString()}`)

    // console.log(`Subscription start date: ${}`)
    // console.log(`Subscription end date: ${new Date(accountdata.endDate.toNumber() * 1000)}`)

    console.log({
      startDate: new Date(accountdata.startDate.toNumber() * 1000),
      endDate: new Date(accountdata.endDate.toNumber() * 1000),
      userBlanceBefore: userTokenBeforTransaction,
      userBalanceAfter: userTokenAfterTransaction,
      paymentBlanceBefore: paymentTokenBeforTransaction,
      paymentBlanceAfter: paymentTokenAfterTransaction,
      userDiffrence:
        userTokenAfterTransaction.value.uiAmount -
        userTokenBeforTransaction.value.uiAmount,
      paymentDiffrence:
        paymentTokenAfterTransaction.value.uiAmount -
        paymentTokenBeforTransaction.value.uiAmount,
    });

    console.log("Your transaction signature", tx);
  });
});
