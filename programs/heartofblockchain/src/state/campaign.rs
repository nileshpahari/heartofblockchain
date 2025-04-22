use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)] // Add derive macro for automatic space calculation
pub struct Campaign {
    pub creator: Pubkey,       // 32 bytes
    #[max_len(50)] // Define max length for String fields for space calculation
    pub name: String,
    #[max_len(200)] // Define max length for String fields for space calculation
    pub description: String,
    pub target_amount: u64,    // 8 bytes
    pub amount_donated: u64,   // 8 bytes
    pub mint: Pubkey,          // 32 bytes
    pub threshold_reached: bool, // 1 byte
    pub bump: u8,              // 1 byte (to store the bump seed)
} 