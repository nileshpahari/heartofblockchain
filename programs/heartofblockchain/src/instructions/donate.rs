use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
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
    #[account(
        mut,
        seeds = [b"campaign".as_ref(), campaign.creator.as_ref(), campaign.name.as_bytes()],
        bump = campaign.bump, // Use stored bump
        has_one = mint @ CampaignError::InvalidMint // Constraint to ensure correct mint
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        // Use constraint matching the campaign's mint field directly
        token::mint = campaign.mint,
        // PDA is the authority, address derived from seeds
        token::authority = campaign,
        token::token_program = token_program, // Specify token program
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(
        mut,
        // Ensure donor's token account is for the correct mint and owned by the donor
        token::mint = campaign.mint,
        token::authority = donor,
        token::token_program = token_program, // Specify token program
    )]
    pub donor_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    // No need to pass mint separately if constrained via campaign.mint
    // pub mint: InterfaceAccount<'info, MintInterface>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>, 
} 