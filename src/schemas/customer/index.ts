export type * from './customer.schema'
export type * from './feedback.schema'

// Replace the loyalty schema exports with specific ones
export {
  listLoyaltySchema,
  loyaltyFiltersSchema
} from './loyalty.schema'

export type {
  LoyaltyFilters,
  ListLoyaltyInput
} from './loyalty.schema'

// Export the loyalty reward types from the dedicated schema
export {
  createLoyaltyRewardSchema,
  updateLoyaltyRewardSchema,
  listLoyaltyRewardsSchema
} from './loyalty-reward.schema'

export type {
  CreateLoyaltyRewardInput,
  UpdateLoyaltyRewardInput,
  LoyaltyRewardFilters,
  ListLoyaltyRewardsInput
} from './loyalty-reward.schema'

export type * from './referral.schema'