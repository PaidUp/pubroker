import { Roles, validate } from '@/util/requireRole'
import { CommerceService } from '@/service'

export default {
  invoices: validate([Roles.CHAP, Roles.API])(async (_, args) => {
    return CommerceService.invoices(args.organizationId, args.seasonId)
  }),
  payments: validate([Roles.COACH, Roles.API])(async (_, args) => {
    return CommerceService.payments(args.organizationId, args.seasonId)
  }),
  getReducePlayers: validate([Roles.CHAP, Roles.API])(async (_, args) => {
    return CommerceService.getReducePlayers(args)
  })
}
