import { BeneficiaryService } from '@/service'
import { Roles, validate } from '@/util/requireRole'

export default {
  createBeneficiary: validate([Roles.CHAP, Roles.API])((parent, args) => {
    return BeneficiaryService.create(args)
  }),

  updateBeneficiary: validate([Roles.CHAP, Roles.API])((parent, args) => {
    return BeneficiaryService.update(args)
  }),

  deleteBeneficiary: validate([Roles.CHAP, Roles.API])((parent, args) => {
    return BeneficiaryService.delete(args)
  })
}
