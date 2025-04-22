import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Heartofblockchain } from "../target/types/heartofblockchain";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { assert, expect } from "chai";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
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
  let serviceProviderTokenAccountKeypair: Keypair; // For the token account
  let serviceProviderAssociatedTokenAccount: PublicKey; // For later withdrawals
  let donorKeypair: Keypair;
  let donorTokenAccount: PublicKey;
  let newAdminKeypair: Keypair;

  before(async () => {
    // Generate keypairs for testing
    serviceProviderKeypair = Keypair.generate();
    donorKeypair = Keypair.generate();
    newAdminKeypair = Keypair.generate();
    serviceProviderTokenAccountKeypair = Keypair.generate();
    
    // Fund the keypairs
    for (const kp of [serviceProviderKeypair, donorKeypair, newAdminKeypair]) {
      const tx = await provider.connection.requestAirdrop(
        kp.publicKey, 
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(tx);
    }
    
    console.log("Funded test accounts");
  });

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
        admin: admin,
      })
      .rpc();
    
    console.log("Your transaction signature", tx);
    
    // Fetch the created account
    const globalConfig = await program.account.globalConfig.fetch(globalConfigPda);
    console.log("Global config admin:", globalConfig.admin.toString());
    
    // Verify that the admin was set correctly
    assert.equal(globalConfig.admin.toString(), admin.toString());
  });

  it("Update global admin", async () => {
    // Get the current admin
    const globalConfig = await program.account.globalConfig.fetch(globalConfigPda);
    const currentAdmin = globalConfig.admin;
    
    // Update the admin to a new keypair
    const tx = await program.methods
      .updateGlobalAdmin(newAdminKeypair.publicKey)
      .accounts({
        globalConfig: globalConfigPda,
        admin: currentAdmin,
      })
      .rpc();
    
    console.log("Update admin transaction signature", tx);
    
    // Fetch the updated account
    const updatedGlobalConfig = await program.account.globalConfig.fetch(globalConfigPda);
    
    // Verify that the admin was updated correctly
    assert.equal(updatedGlobalConfig.admin.toString(), newAdminKeypair.publicKey.toString());
    
    // Reset the admin back to the original for other tests
    await program.methods
      .updateGlobalAdmin(currentAdmin)
      .accounts({
        globalConfig: globalConfigPda,
        admin: newAdminKeypair.publicKey,
      })
      .signers([newAdminKeypair])
      .rpc();
  });

  it("Create a new campaign", async () => {
    // Create a new token mint for testing

    // creation of usdc 
    mint = await createMint(
      provider.connection,
      wallet.payer, // payer
      wallet.publicKey, // mint authority
      wallet.publicKey, // freeze authority (you can use `null` to disable it)
      6 // decimals
    );
    console.log("Created test token mint:", mint.toString());

    // Also create an associated token account for later withdrawal
    const spTokenAcc = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      mint,
      serviceProviderKeypair.publicKey
    );
    serviceProviderAssociatedTokenAccount = spTokenAcc.address;

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
        creator: serviceProviderKeypair.publicKey,
        mint: mint,
      })
      .signers([serviceProviderKeypair])
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

  it("Donate to a campaign", async () => {
    // Create donor token account
    const donorTokenAcc = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      mint,
      donorKeypair.publicKey
    );
    donorTokenAccount = donorTokenAcc.address;
    
    // Mint 2000 tokens to the donor (with 6 decimals)
    await mintTo(
      provider.connection,
      wallet.payer,
      mint,
      donorTokenAccount,
      wallet.publicKey,
      2000000000
    );
    
    console.log("Minted tokens to donor account:", donorTokenAccount.toString());
    
    // Check donor balance
    const donorAccount = await getAccount(provider.connection, donorTokenAccount);
    assert.equal(Number(donorAccount.amount), 2000000000);
    
    // Donate 500 tokens to the campaign
    const donationAmount = new anchor.BN(500000000);
    
    const tx = await program.methods
      .donate(donationAmount)
      .accounts({
        campaign: campaignPda,
        donor: donorKeypair.publicKey,
        mint: mint,
      })
      .signers([donorKeypair])
      .rpc();
    
    console.log("Donation transaction:", tx);
    
    // Fetch the updated campaign
    const updatedCampaign = await program.account.campaign.fetch(campaignPda);
    
    // Verify donation was recorded
    assert.equal(updatedCampaign.amountDonated.toNumber(), donationAmount.toNumber());
    assert.equal(updatedCampaign.thresholdReached, false);
    
    // Check donor balance after donation
    const updatedDonorAccount = await getAccount(provider.connection, donorTokenAccount);
    assert.equal(Number(updatedDonorAccount.amount), 1500000000);
    
    // Donate more to reach threshold
    const secondDonationAmount = new anchor.BN(600000000);
    
    await program.methods
      .donate(secondDonationAmount)
      .accounts({
        campaign: campaignPda,
        donor: donorKeypair.publicKey,
        mint: mint,
      })
      .signers([donorKeypair])
      .rpc();
    
    // Verify threshold was reached
    const finalCampaign = await program.account.campaign.fetch(campaignPda);
    assert.equal(finalCampaign.amountDonated.toNumber(), 1100000000); // Total of both donations
    assert.equal(finalCampaign.thresholdReached, true);
  });

  it("Withdraw from campaign", async () => {
    // Get token account balance before withdrawal
    // We use the associated token account for withdrawal
    
    // Perform withdrawal
    const tx = await program.methods
      .withdraw()
      .accounts({
        campaign: campaignPda,
        creator: serviceProviderKeypair.publicKey,
        mint: mint,
      })
      .signers([serviceProviderKeypair])
      .rpc();
    
    console.log("Withdrawal transaction:", tx);
    
    // Get creator token account balance after withdrawal
    const creatorTokenAccountAfter = await getAccount(
      provider.connection, 
      serviceProviderAssociatedTokenAccount
    );
    const balanceAfter = Number(creatorTokenAccountAfter.amount);
    
    // Verify withdrawal
    assert(balanceAfter >= 1100000000, "Creator should have received the funds");
    
    // Fetch the campaign and verify it was reset
    const updatedCampaign = await program.account.campaign.fetch(campaignPda);
    assert.equal(updatedCampaign.amountDonated.toNumber(), 0);
    assert.equal(updatedCampaign.thresholdReached, false);
  });

  it("Should fail to withdraw if threshold not reached", async () => {
    // Create a new campaign for this test
    const campaignName = "Test Campaign 2";
    const campaignDescription = "A second test campaign for threshold check";
    const targetAmount = new anchor.BN(2000000000); // 2000 tokens with 6 decimals
    
    // Find the campaign PDA
    let campaign2Pda: PublicKey;
    [campaign2Pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        serviceProviderKeypair.publicKey.toBuffer(),
        Buffer.from(campaignName)
      ],
      program.programId
    );

    // Create a new token account for the campaign
    const spTokenAccountKeypair = Keypair.generate();
    
    // Create the campaign
    await program.methods
      .createCampaign(
        campaignName,
        campaignDescription,
        targetAmount
      )
      .accounts({
        creator: serviceProviderKeypair.publicKey,
        mint: mint,
      })
      .signers([serviceProviderKeypair])
      .rpc();
    
    // Make a small donation that doesn't meet threshold
    const smallDonation = new anchor.BN(100000000); // Only 100 tokens
    
    await program.methods
      .donate(smallDonation)
      .accounts({
        campaign: campaign2Pda,
        donor: donorKeypair.publicKey,
        mint: mint,
      })
      .signers([donorKeypair])
      .rpc();
    
    // Try to withdraw and expect failure
    try {
      await program.methods
        .withdraw()
        .accounts({
          campaign: campaign2Pda,
          creator: serviceProviderKeypair.publicKey,
          mint: mint,
        })
        .signers([serviceProviderKeypair])
        .rpc();
      
      // If we reach here, the test failed
      assert.fail("Withdrawal should have failed");
    } catch (err: any) {
      // Expect error about threshold not reached
      console.log("Expected error occurred:", err.message);
      expect(err.message).to.include("threshold");
    }
  });

  it("Should fail if non-creator tries to withdraw", async () => {
    // Create a new campaign that will reach threshold
    const campaignName = "Test Campaign 3";
    const campaignDescription = "A third test campaign for auth check";
    const targetAmount = new anchor.BN(500000000); // 500 tokens with 6 decimals
    
    // Find the campaign PDA
    let campaign3Pda: PublicKey;
    [campaign3Pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        serviceProviderKeypair.publicKey.toBuffer(),
        Buffer.from(campaignName)
      ],
      program.programId
    );

    // Create a new token account for the campaign
    const spTokenAccountKeypair = Keypair.generate();
    
    // Create the campaign
    await program.methods
      .createCampaign(
        campaignName,
        campaignDescription,
        targetAmount
      )
      .accounts({
        creator: serviceProviderKeypair.publicKey,
        mint: mint,
      })
      .signers([serviceProviderKeypair, spTokenAccountKeypair])
      .rpc();
    
    // Make donation to reach threshold
    const donation = new anchor.BN(500000000);
    
    await program.methods
      .donate(donation)
      .accounts({
        campaign: campaign3Pda,
        donor: donorKeypair.publicKey,
        mint: mint,
      })
      .signers([donorKeypair])
      .rpc();
    
    // Verify threshold is reached
    const campaign = await program.account.campaign.fetch(campaign3Pda);
    assert.equal(campaign.thresholdReached, true);
    
    // Try to withdraw as non-creator (donor)
    try {
      await program.methods
        .withdraw()
        .accounts({
          campaign: campaign3Pda,
          creator: donorKeypair.publicKey,         // Using donor instead of creator
          mint: mint,
        })
        .signers([donorKeypair])
        .rpc();
      
      // If we reach here, the test failed
      assert.fail("Non-creator withdrawal should have failed");
    } catch (err: any) {
      // Expect constraint error
      console.log("Expected error occurred:", err.message);
      expect(err.message).to.include("Unauthorized");
    }
  });
});
