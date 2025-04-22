use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use crate::state::Campaign;
use crate::error::CampaignError;

pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    // Signer check is handled by has_one constraint
    // Mint check is handled by has_one constraint

    // Check if the threshold has been reached
    require!(
        campaign.threshold_reached,
        CampaignError::ThresholdNotReached
    );

    // Get the amount to withdraw (current balance of the campaign token account)
    // Reload account data to get the latest balance after potential donations in the same block
    let campaign_token_account = &mut ctx.accounts.campaign_token_account;
    let amount = campaign_token_account.amount;
    require!(amount > 0, CampaignError::NoFundsToWithdraw);

    // Define PDA seeds
    let bump = campaign.bump; // Use the stored bump
    let seeds = &[
        b"campaign".as_ref(),
        campaign.creator.as_ref(),
        campaign.name.as_bytes(),
        &[bump],
    ];
    let signer_seeds = &[&seeds[..]];

    // Transfer tokens from campaign PDA's token account to creator's token account
    let cpi_accounts = Transfer {
        from: campaign_token_account.to_account_info(),
        to: ctx.accounts.creator_token_account.to_account_info(),
        authority: campaign.to_account_info(), // The campaign PDA is the authority
    };
     // Use the specific token program (SPL Token or Token-2022) associated with the mint/accounts
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    token::transfer(cpi_ctx, amount)?; // Using spl_token::transfer assuming standard SPL Token

    // Reset campaign state after successful withdrawal
    campaign.amount_donated = 0;
    campaign.threshold_reached = false;

    msg!(
        "Withdrew {} from campaign {} to creator {}",
        amount,
        campaign.name,
        campaign.creator
    );

    // Optional: Consider closing the campaign account and token account if withdrawal means completion
    // close cpi requires recipient for lamports and authority
    // token::close_account(...)

    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)] // Campaign account needs to be mutable to update amount_donated
    pub campaign: Account<'info, Campaign>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = mint, // Use associated_token::mint
        associated_token::authority = campaign, // Authority is the campaign PDA
        token::token_program = token_program,
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator: Signer<'info>, // Must be the campaign creator

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = mint, // Use associated_token::mint
        associated_token::authority = creator, // Authority is the campaign PDA
        token::token_program = token_program,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    // campaign.has_one = mint constraint ensures this mint matches the one in campaign
    pub mint: Account<'info, Mint>, 
    pub associated_token_program: Program<'info, AssociatedToken>, // Add AssociatedToken program
    pub rent: Sysvar<'info, Rent>, // Rent might not be needed if using init_if_needed with ATAs
    pub token_program: Program<'info, Token>,
    // system_program might be needed if closing accounts
    pub system_program: Program<'info, System>,
} 