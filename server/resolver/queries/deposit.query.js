import { Roles, validate } from '@/util/requireRole'
import { DepositsService } from '@/service'

export const fetchTransfers = validate([Roles.COACH, Roles.API])(async (_, { account, arrival, source }) => {
  return DepositsService.fetchTransfers(account, arrival, source)
})

export const fetchPayouts = validate([Roles.COACH, Roles.API])(async (_, { account }) => {
  return DepositsService.fetchPayouts(account)
})
