import { PaymentService } from '@/service'
import { Roles, validate } from '@/util/requireRole'

export default {
  verifySource: validate([Roles.PARENT, Roles.API])((parent, { customerId, sourceId, amounts }, { user }) => {
    return PaymentService.verifySource(customerId, sourceId, amounts).then(res => res)
  })
}
