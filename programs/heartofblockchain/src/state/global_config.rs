use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)] // Add derive macro for automatic space calculation
pub struct GlobalConfig {
    pub admin: Pubkey, // 32 bytes
    pub bump: u8,      // 1 byte (to store the bump seed)
} 