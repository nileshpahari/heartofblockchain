use anchor_lang::prelude::*;
use crate::state::GlobalConfig;
use crate::error::CampaignError;

pub fn update_global_admin(ctx: Context<UpdateGlobalAdmin>, new_admin: Pubkey) -> Result<()> {
    let global_config = &mut ctx.accounts.global_config;
    // Optional: Add check if new_admin is different from old admin
    require_keys_neq!(global_config.admin, new_admin, CampaignError::AdminCannotBeSame);
    global_config.admin = new_admin;
    msg!("Global admin updated to: {}", new_admin);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateGlobalAdmin<'info> {
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump, // Use stored bump for constraint checking
        has_one = admin @ CampaignError::UnauthorizedAdmin // Constraint: only current admin can update
    )]
    pub global_config: Account<'info, GlobalConfig>,
    // The current admin signing the transaction (must match global_config.admin)
    pub admin: Signer<'info>,
} 