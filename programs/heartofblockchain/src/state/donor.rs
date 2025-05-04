use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Donor {
    pub donor: Pubkey,
    pub campaign: Pubkey,
    pub amount_donated: u64,
    pub bump: u8,
} 