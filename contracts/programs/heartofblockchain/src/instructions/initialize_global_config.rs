use anchor_lang::prelude::*;
use crate::state::GlobalConfig;

pub fn initialize_global_config(ctx: Context<InitializeGlobalConfig>) -> Result<()> {
    let global_config = &mut ctx.accounts.global_config;
    global_config.admin = *ctx.accounts.admin.key;
    global_config.bump = ctx.bumps.global_config;
    msg!("Global config initialized. Admin: {}", global_config.admin);
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeGlobalConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + GlobalConfig::INIT_SPACE,
        seeds = [b"global_config"],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
} 