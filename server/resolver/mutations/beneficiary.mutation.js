import { BeneficiaryService } from '@/service'
import { Roles, validate } from '@/util/requireRole'

export default {
  createBeneficiary: validate([Roles.CHAP, Roles.PARENT, Roles.API])((parent, args) => {
    return BeneficiaryService.save(args)
  }),

  updateBeneficiary: validate([Roles.CHAP, Roles.PARENT, Roles.API])((parent, args) => {
    const id = args.id
    const { firstName, lastName, assigneesEmail, description } = args
    return BeneficiaryService.update(id, { firstName, lastName, assigneesEmail, description })
  }),

  deleteBeneficiary: validate([Roles.CHAP, Roles.PARENT, Roles.API])(async (parent, args) => {
    return BeneficiaryService.delete(args.id).then(res => true).catch(reason => false)
  })
}
