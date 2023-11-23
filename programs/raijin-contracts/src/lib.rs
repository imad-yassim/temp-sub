use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::{create_subscription::*, update_subscription::*};

declare_id!("Nzi9zm349ScroWe45h16Cy6j2m1DHFNDGjKXoPKjdBh");

#[program]
pub mod raijin_contracts {
    use super::*;

    /// Creates a new subscription.
    pub fn create_monthly_subscription(ctx: Context<CreateSubscriptionAccounts>) -> Result<()> {
        create_monthly_subscription_instruction(ctx)
    }

    /// Creates a new subscription.
    pub fn create_yearlly_subscription(ctx: Context<CreateSubscriptionAccounts>) -> Result<()> {
        create_yearly_subscription_instruction(ctx)
    }

    /// Updates an existing subscription.
    pub fn extend_subscription(ctx: Context<UpdateSubscribtionAccounts>, value: u8) -> Result<()> {
        update_subscription_instruction(ctx, value);
        Ok(())
    }
}
