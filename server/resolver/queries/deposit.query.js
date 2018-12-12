import { Roles, validate } from '@/util/requireRole'
import { DepositsService } from '@/service'

export const fetchBalanceHistory = validate([Roles.COACH, Roles.API])(async (_, { account, payout }) => {
  return DepositsService.fetchBalanceHistory(account, payout).then(res => res).catch(reason => {
    console.log('reason: ', reason)
    throw reason
  })
})

export const fetchPayouts = validate([Roles.COACH, Roles.API])(async (_, { account, limit, startingAfter, endingBefore }) => {
  return DepositsService.fetchPayouts({ account, limit, startingAfter, endingBefore })
})
