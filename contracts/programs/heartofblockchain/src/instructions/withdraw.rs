use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use crate::state::Campaign;
use crate::error::CampaignError;

pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    require!(
        campaign.threshold_reached,
        CampaignError::ThresholdNotReached
    );

    let campaign_token_account = &mut ctx.accounts.campaign_token_account;
    let amount = campaign_token_account.amount;
    require!(amount > 0, CampaignError::NoFundsToWithdraw);

    let bump = campaign.bump; 
    let seeds = &[
        b"campaign".as_ref(),
        campaign.creator.as_ref(),
        campaign.name.as_bytes(),
        &[bump],
    ];
    
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: campaign_token_account.to_account_info(),
        to: ctx.accounts.creator_token_account.to_account_info(),
        authority: campaign.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    token::transfer(cpi_ctx, amount)?;

    campaign.amount_donated = 0;
    campaign.threshold_reached = false;

    msg!(
        "Withdrew {} from campaign {} to creator {} and closed campaign account",
        amount,
        campaign.name,
        campaign.creator
    );

    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut,has_one = mint, constraint = creator.key() == campaign.creator)]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = campaign,
        token::token_program = token_program,
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = creator,
        token::token_program = token_program,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>, 
    pub associated_token_program: Program<'info, AssociatedToken>, 
    pub rent: Sysvar<'info, Rent>, 
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
} 