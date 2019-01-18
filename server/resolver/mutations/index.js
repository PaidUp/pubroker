import user from './user.mutation'
import preorder from './preorder.mutation'
import credit from './credit.mutation'
import common from './common.mutation'
import payment from './payment.mutation'
import beneficiary from './beneficiary.mutation'
import organization from './organization.mutation'

export default {
  ...user,
  ...preorder,
  ...credit,
  ...common,
  ...payment,
  ...beneficiary,
  ...organization
}
