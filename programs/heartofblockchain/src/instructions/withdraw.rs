use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::Campaign;
use crate::error::CampaignError;

pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
    let campaign = &ctx.accounts.campaign;

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
    #[account(
        mut, // May need mut if we decide to close it later
        seeds = [b"campaign".as_ref(), campaign.creator.as_ref(), campaign.name.as_bytes()],
        bump = campaign.bump,
        has_one = creator @ CampaignError::Unauthorized, // Ensure signer is the creator
        has_one = mint @ CampaignError::InvalidMint // Ensure correct mint associated with campaign data
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        token::mint = mint, // Use the mint passed in constraints/context
        token::authority = campaign, // PDA is the authority
        token::token_program = token_program,
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator: Signer<'info>, // Must be the campaign creator

    #[account(
        mut,
        token::mint = mint, // Creator's token account for the same mint
        token::authority = creator,
        token::token_program = token_program,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    // campaign.has_one = mint constraint ensures this mint matches the one in campaign
    pub mint: Account<'info, Mint>, 

    pub token_program: Program<'info, Token>,
    // system_program might be needed if closing accounts
    // pub system_program: Program<'info, System>,
} 