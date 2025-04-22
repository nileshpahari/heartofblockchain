import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Heartofblockchain } from "../target/types/heartofblockchain";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createAccount,
  getAccount,
} from "@solana/spl-token";

describe("heartofblockchain", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Heartofblockchain as Program<Heartofblockchain>;
  const provider = anchor.getProvider();
  const wallet = anchor.workspace.Heartofblockchain.provider.wallet;

  // State to store between tests
  let globalConfigPda: PublicKey;
  let mint: PublicKey;
  let campaignPda: PublicKey;
  let serviceProviderKeypair: Keypair;
  let serviceProviderTokenAccountKeypair: Keypair;

  it("Initialize global config", async () => {
    // Admin will be the wallet that's currently connected
    const admin = provider.publicKey;
    
    // Find the Global Config PDA
    [globalConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_config")],
      program.programId
    );
    
    const tx = await program.methods
      .initializeGlobalConfig()
      .accounts({
        globalConfig: globalConfigPda,
        admin: admin,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log("Your transaction signature", tx);
    
    // Fetch the created account
    const globalConfig = await program.account.globalConfig.fetch(globalConfigPda);
    console.log("Global config admin:", globalConfig.admin.toString());
    
    // Verify that the admin was set correctly
    assert.equal(globalConfig.admin.toString(), admin.toString());
  });

  it("Create a new campaign", async () => {
    // Create a keypair for the service provider
    serviceProviderKeypair = Keypair.generate();
    
    // Fund the service provider keypair
    const airdropTx = await provider.connection.requestAirdrop(
      serviceProviderKeypair.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx);
    
    // Create a new token mint for testing
    mint = await createMint(
      provider.connection,
      wallet.payer, // payer
      wallet.publicKey, // mint authority
      wallet.publicKey, // freeze authority (you can use `null` to disable it)
      6 // decimals
    );
    console.log("Created test token mint:", mint.toString());

    // Create a keypair for the token account
    serviceProviderTokenAccountKeypair = Keypair.generate();
    
    // Campaign details
    const campaignName = "Test Campaign";
    const campaignDescription = "A test campaign created for testing purposes";
    const targetAmount = new anchor.BN(1000000000); // 1000 tokens with 6 decimals
    
    // Find the campaign PDA
    [campaignPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        serviceProviderKeypair.publicKey.toBuffer(),
        Buffer.from(campaignName)
      ],
      program.programId
    );
    
    // Create the campaign
    const tx = await program.methods
      .createCampaign(
        campaignName,
        campaignDescription,
        targetAmount
      )
      .accounts({
        campaign: campaignPda,
        serviceProviderTokenAccount: serviceProviderTokenAccountKeypair.publicKey,
        creator: serviceProviderKeypair.publicKey,
        mint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([serviceProviderKeypair, serviceProviderTokenAccountKeypair])
      .rpc();
    
    console.log("Campaign created with transaction:", tx);
    
    // Fetch the campaign to verify it was created correctly
    const campaign = await program.account.campaign.fetch(campaignPda);
    console.log("Campaign:", campaign);
    
    // Verify campaign details
    assert.equal(campaign.name, campaignName);
    assert.equal(campaign.description, campaignDescription);
    assert(campaign.targetAmount.eq(targetAmount));
    assert.equal(campaign.creator.toString(), serviceProviderKeypair.publicKey.toString());
    assert.equal(campaign.mint.toString(), mint.toString());
    assert.equal(campaign.thresholdReached, false);
    assert.equal(campaign.amountDonated.toNumber(), 0);
  });
});
