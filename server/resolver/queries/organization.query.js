import { Roles, validate } from '@/util/requireRole'
import { OrganizationService } from '@/service'

export default {
  getReducePlans: validate([Roles.CHAP, Roles.API])(async (_, { productId }) => {
    return OrganizationService.getReducePlans(productId)
  }),
  getPlans: validate([Roles.CHAP, Roles.PARENT, Roles.COACH, Roles.API])(async (_, { productId }) => {
    return OrganizationService.getPlans(productId)
  })
}
