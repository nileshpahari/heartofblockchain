use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token::{self, Mint, Token, TokenAccount, Transfer},
};
use crate::state::{Campaign, Donor};
use crate::error::CampaignError;

pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
    require!(amount > 0, CampaignError::DonationAmountMustBePositive);

    let campaign = &mut ctx.accounts.campaign;
    let donor_pda = &mut ctx.accounts.donor_pda;

    let cpi_accounts = Transfer {
        from: ctx.accounts.donor_token_account.to_account_info(),
        to: ctx.accounts.campaign_token_account.to_account_info(),
        authority: ctx.accounts.donor.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    campaign.amount_donated = campaign.amount_donated.checked_add(amount).ok_or(CampaignError::Overflow)?;

    donor_pda.amount_donated = donor_pda.amount_donated.checked_add(amount).ok_or(CampaignError::Overflow)?;

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
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init_if_needed,
        payer = donor,
        associated_token::mint = mint,
        associated_token::authority = campaign,
        token::token_program = token_program,
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(
        init_if_needed,
        payer = donor,
        associated_token::mint = mint,
        associated_token::authority = donor,
        token::token_program = token_program,
    )]
    pub donor_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = donor,
        space = 8 + Donor::INIT_SPACE,
        seeds = [b"donor", donor.key().as_ref(), campaign.key().as_ref()],
        bump
    )]
    pub donor_pda: Account<'info, Donor>,

    #[account(
        constraint = mint.key() == campaign.mint @ CampaignError::InvalidMint
    )]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}