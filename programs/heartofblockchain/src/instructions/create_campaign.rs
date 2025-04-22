use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint};
use crate::state::Campaign;
use crate::error::CampaignError;
use anchor_spl::token::{TokenAccount, Token};

pub fn create_campaign(
    ctx: Context<CreateCampaign>,
    name: String,
    description: String,
    target_amount: u64,
) -> Result<()> {
    // Basic validation (can be enhanced)
    require!(!name.is_empty(), CampaignError::NameCannotBeEmpty);
    require!(name.len() <= 50, CampaignError::NameTooLong); // Example length check
    require!(!description.is_empty(), CampaignError::DescriptionCannotBeEmpty);
    require!(description.len() <= 200, CampaignError::DescriptionTooLong); // Example length check
    require!(target_amount > 0, CampaignError::TargetAmountMustBePositive);

    let campaign = &mut ctx.accounts.campaign;
    campaign.creator = *ctx.accounts.creator.key;
    campaign.name = name; // No need to clone if passed by value and consumed
    campaign.description = description; // No need to clone if passed by value and consumed
    campaign.target_amount = target_amount;
    campaign.amount_donated = 0;
    campaign.mint = ctx.accounts.mint.key();
    campaign.threshold_reached = false;
    campaign.bump = ctx.bumps.campaign; // Store bump for PDA signing

    msg!(
        "Campaign created: Creator: {}, Name: {}, Target: {}, Mint: {}",
        campaign.creator,
        campaign.name,
        campaign.target_amount,
        campaign.mint
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String, description: String)] // Need name and potentially description if used in seeds or size calculation
pub struct CreateCampaign<'info> {
    #[account(
        init,
        payer = creator,
        // Use init_space for automatic calculation based on struct fields
        // Add space for variable length fields like String if needed, otherwise Anchor calculates based on initial state
        space = 8 + Campaign::INIT_SPACE + name.len() + description.len(), // Add max expected lengths if they can grow, or use realloc later
        seeds = [b"campaign".as_ref(), creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = creator,
        // Using Token Interface here for broader compatibility (SPL Token & Token-2022)
        token::mint = mint,
        token::authority = campaign, // PDA is the authority
        token::token_program = token_program,
    )]
    pub service_provider_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator: Signer<'info>,

    // Using MintInterface for broader compatibility
    mint: InterfaceAccount<'info, Mint>,

    // Programs required
    pub system_program: Program<'info, System>,
    // Use TokenInterface for broader compatibility
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>, // Rent is needed for init if not using zero-copy
} 