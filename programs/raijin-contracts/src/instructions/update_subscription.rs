use crate::state::subscription::*;
use anchor_lang::prelude::*;

pub fn update_subscription_instruction(ctx: Context<UpdateSubscriptionAccounts>, _paid: u8) {}

#[derive(Accounts)]
pub struct UpdateSubscriptionAccounts<'info> {
    #[account(
		init,
  		seeds = [ b"subscription_data_accoudnt", user.key().as_ref() ],
		bump,
		payer = user,
		space = 9 , // 8(for anchor) + 1(months_to_extend: u8) + 1(for bump)
		)]
    pub subscription_data_account: Account<'info, SubscriptionAccountStruct>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
