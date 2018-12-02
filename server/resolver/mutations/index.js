import userMutation from './user.mutation'
import preorderMutation from './preorder.mutation'
import creditMutation from './credit.mutation'
import commonMutation from './common.mutation'
import paymentMutation from './payment.mutation'

export default {
  ...userMutation,
  ...preorderMutation,
  ...creditMutation,
  ...commonMutation,
  ...paymentMutation
}
