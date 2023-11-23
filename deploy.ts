import { program } from "@coral-xyz/anchor/dist/cjs/native/system";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import spawn from "child_process";
import * as fs from "fs";
import path from "path"

const PROGRAM_AUTHORITY_KEYPAIR_FILE_NAME = `deploy/program-authority-keypair.json`;
const PROGRAM_AUTHORITY_KEYPAIR_FILE_PATH = path.resolve(
    `${__dirname}${path.sep}${PROGRAM_AUTHORITY_KEYPAIR_FILE_NAME}`
);

const connection = new Connection("https://api.devnet.solana.com/", "confirmed");

(async () => {
    
  let method: string[];

  if (!fs.existsSync(PROGRAM_AUTHORITY_KEYPAIR_FILE_PATH)) {
    // PROGRAM DOESN'T EXIST, DEPLOY NEW ONE
    console.log("Setting deployment type to deploy")

    spawn.spawnSync("anchor", ["build"], {stdio: "inherit"});

    const programAuthorityKeyPair = new Keypair();
    console.log(`\n✅Created Authority Keypair : ${programAuthorityKeyPair.publicKey}.\n`)

    const transaction = await connection.requestAirdrop(programAuthorityKeyPair.publicKey, 5 * LAMPORTS_PER_SOL);

    await connection.confirmTransaction(transaction);
    console.log(`\n✅ Airdrop 5 SOL to : ${programAuthorityKeyPair.publicKey}.\n`)

    console.log(`\nSaving keypair to file  : ${PROGRAM_AUTHORITY_KEYPAIR_FILE_PATH} ...\n`)
      fs.writeFileSync(
        PROGRAM_AUTHORITY_KEYPAIR_FILE_PATH,
        `[${Buffer.from(
          programAuthorityKeyPair.secretKey.toString()
          )}
        ]`
      )
      console.log(`\n✅Done saving keypair to file  : ${PROGRAM_AUTHORITY_KEYPAIR_FILE_PATH}.\n`)
      
      method = ["deploy"]

} else {
    // PROGRAM EXIST, UPGRADE IT

    console.log("Setting deployment type to upgrade")
    
    method = ["upgrade"]
  }
    spawn.spawnSync("anchor",
     [... method,
       "--provider.cluster", "Devnet",
        "--provider.wallet", `${PROGRAM_AUTHORITY_KEYPAIR_FILE_PATH}`
      ],
      {stdio: "inherit"},
    )
})(); 