import { Roles, validate } from '@/util/requireRole'
import { DepositsService } from '@/service'

export const fetchTransfers = async (_, { account, arrival }) => {
  return DepositsService.fetchTransfers(account, arrival)
}

export const fetchPayments = validate([Roles.COACH, Roles.API])(async (_, { account }) => {
  return DepositsService.fetchPayments(account)
})
