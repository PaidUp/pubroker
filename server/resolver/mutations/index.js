import userMutation from './user.mutation'
import preorderMutation from './preorder.mutation'
import creditMutation from './credit.mutation'
import commonMutation from './common.mutation'
import paymentMutation from './payment.mutation'
import commerceBeneficiary from './commerce-beneficiary'

export default {
  ...userMutation,
  ...preorderMutation,
  ...creditMutation,
  ...commonMutation,
  ...paymentMutation,
  ...commerceBeneficiary
}
