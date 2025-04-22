use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token::{self, Mint, Token, TokenAccount, Transfer},
};
use crate::state::Campaign;
use crate::error::CampaignError;


pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
    require!(amount > 0, CampaignError::DonationAmountMustBePositive);

    let campaign = &mut ctx.accounts.campaign;

    // Check if the provided mint matches the campaign's mint is already handled by has_one

    // Transfer tokens from donor to campaign PDA's token account
    let cpi_accounts = Transfer {
        from: ctx.accounts.donor_token_account.to_account_info(),
        to: ctx.accounts.campaign_token_account.to_account_info(),
        authority: ctx.accounts.donor.to_account_info(),
    };
    // Use the specific token program (SPL Token or Token-2022) associated with the mint/accounts
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?; // Using spl_token::transfer assuming standard SPL Token

    // Update donated amount
    campaign.amount_donated = campaign.amount_donated.checked_add(amount).ok_or(CampaignError::Overflow)?;

    // Check if threshold reached (idempotent check)
    if !campaign.threshold_reached && campaign.amount_donated >= campaign.target_amount {
        campaign.threshold_reached = true;
        msg!("Campaign threshold reached!");
    }

    msg!(
        "Donated {} to campaign {}. Total donated: {}",
        amount,
        campaign.name,
        campaign.amount_donated
    );
    Ok(())
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)] // Campaign account needs to be mutable to update amount_donated
    pub campaign: Account<'info, Campaign>,

    #[account(
        init_if_needed,
        payer = donor,
        associated_token::mint = mint, // Use associated_token::mint
        associated_token::authority = campaign, // Authority is the campaign PDA
        token::token_program = token_program,
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(
        // Use associated_token constraints for donor's ATA as well for consistency
        // Although init_if_needed might be handled by the client, it's good practice
        init_if_needed,
        payer = donor,
        associated_token::mint = mint,
        associated_token::authority = donor,
        token::token_program = token_program,
    )]
    pub donor_token_account: Account<'info, TokenAccount>, // Should be mut if it needs creation

    #[account(
        // Ensure the mint account provided matches the one stored in the campaign
        // This constraint assumes campaign account has a field `token_mint: Pubkey`
        // If not, this constraint needs adjustment or removal if mint check is done differently
        // constraint = mint.key() == campaign.token_mint @ CampaignError::InvalidMint
    )]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>, // Add AssociatedToken program
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>, // Rent might not be needed if using init_if_needed with ATAs
}