use anchor_lang::prelude::*;

#[account]
pub struct SubscriptionAccountStruct {
    pub bump: u8,
    pub start_date: i64,
    pub end_date: i64,
}
