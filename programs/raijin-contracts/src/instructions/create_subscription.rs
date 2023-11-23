use crate::state::subscription::*;
use anchor_lang::prelude::*;

use anchor_spl::{
    token,
    token::{Token, TokenAccount, Transfer as SplTransfer},
};
use solana_program::{pubkey, pubkey::Pubkey};

const SECONDS_PER_MONTHLY_SUBSCRIPTION: i64 = 2592000; // 30days * 24hours * 60minuts * 60seconds
const SECONDS_PER_YEARLY_SUBSCRIPTION: i64 = 31104000; // 30days * 24hours * 60minuts * 60seconds

const MONTHLY_SUBSCRIPTION_PRICE: u64 = 1 * 1000000000;
const YEARLY_SUBSCRIPTION_PRICE: u64 = 12 * 1000000000;

// TRANSFER SOL
const PAYMENT_TOKEN_ACCOUNT: Pubkey = pubkey!("3zmn769r8KzPUfMDtxqZpiEDe4pTgkdArHqe2aiD556o");

/// Transfer ryu token from user to payement account
fn retrive_payment(ctx: &Context<CreateSubscriptionAccounts>, amount: u64) -> Result<()> {
    let cpi_accounts = SplTransfer {
        from: ctx.accounts.user_ata.to_account_info().clone(),
        to: ctx.accounts.payment_collector_ata.to_account_info().clone(),
        authority: ctx.accounts.user.to_account_info().clone(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();

    token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

    Ok(())
}

/// Create subscription for a user.
fn createsubscription_instruction(
    ctx: Context<CreateSubscriptionAccounts>,
    subscription_duration_by_seconds: i64,
) -> Result<()> {
    let now = Clock::get().unwrap().unix_timestamp;
    let end: i64 = now + subscription_duration_by_seconds;
    let bump: u8 = ctx.bumps.subscription_data_account;

    msg!("Setting subscription bump to {}", bump);
    ctx.accounts.subscription_data_account.bump = bump;

    msg!("Setting subscription start data to {} ", now);
    ctx.accounts.subscription_data_account.start_date = now;

    msg!("Setting subscription end data to {} ", end);
    ctx.accounts.subscription_data_account.end_date = end;

    Ok(())
}

/// Create subscription for a user with a month duration .
pub fn create_monthly_subscription_instruction(
    ctx: Context<CreateSubscriptionAccounts>,
) -> Result<()> {
    msg!("Approve user tokens");
    let _payment = retrive_payment(&ctx, MONTHLY_SUBSCRIPTION_PRICE);
    return createsubscription_instruction(ctx, SECONDS_PER_MONTHLY_SUBSCRIPTION);
}

/// Create subscription for a user with a year duration .
pub fn create_yearly_subscription_instruction(
    ctx: Context<CreateSubscriptionAccounts>,
) -> Result<()> {
    msg!("Approve user tokens");
    let _payment = retrive_payment(&ctx, YEARLY_SUBSCRIPTION_PRICE);
    return createsubscription_instruction(ctx, SECONDS_PER_YEARLY_SUBSCRIPTION);
}

#[derive(Accounts)]
pub struct CreateSubscriptionAccounts<'info> {
    #[account(
			init,
			payer = user,
			space = 25 , // 8(for anchor) + 2 * 6-8(i64) + 1(for bump)
			seeds = [ b"subscription_data_account", user.key().as_ref(), b"lfgdffjoioed-lfooi" ],
			bump,
		)]
    pub subscription_data_account: Account<'info, SubscriptionAccountStruct>,

    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,

    #[account(mut, address = PAYMENT_TOKEN_ACCOUNT)]
    pub payment_collector_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
