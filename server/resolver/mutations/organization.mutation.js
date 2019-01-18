import { OrganizationService } from '@/service'
import { Roles, validate } from '@/util/requireRole'

export default {
  createPaymentPlan: validate([Roles.CHAP, Roles.API])(async (parent, args) => {
    console.log('arg: ', args)
    const response = await OrganizationService.createPaymentPlan(args)
    return response
  })
}
