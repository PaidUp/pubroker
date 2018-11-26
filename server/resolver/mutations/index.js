import userMutation from './user.mutation'
import preorderMutation from './preorder.mutation'
import creditMutation from './credit.mutation'
import commonMutation from './common.mutation'

export default {
  ...userMutation,
  ...preorderMutation,
  ...creditMutation,
  ...commonMutation
}
