import { Roles, validate } from '@/util/requireRole'
import { DepositsService } from '@/service'

export default {
  fetchBalanceHistory: validate([Roles.COACH, Roles.API])(async (_, { account, payout }) => {
    return DepositsService.fetchBalanceHistory(account, payout)
  }),
  fetchPayouts: validate([Roles.COACH, Roles.API])(async (_, { account, limit, startingAfter, endingBefore }) => {
    return DepositsService.fetchPayouts({ account, limit, startingAfter, endingBefore })
  })
}
