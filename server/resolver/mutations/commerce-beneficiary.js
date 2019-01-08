import { BeneficiaryService } from '@/service'
import { Roles, validate } from '@/util/requireRole'

export default {
  createBeneficiary: validate([Roles.CHAP, Roles.API])((parent, args) => {
    return BeneficiaryService.create(args)
  }),

  updateBeneficiary: validate([Roles.CHAP, Roles.API])((parent, args) => {
    const id = args.id
    const { firstName, lastName, assigneesEmail, description } = args
    return BeneficiaryService.update(id, { firstName, lastName, assigneesEmail, description })
  }),

  deleteBeneficiary: validate([Roles.CHAP, Roles.API])(async (parent, args) => {
    return BeneficiaryService.delete(args.id).then(res => true).catch(reason => false)
  })
}
