import commerceQuery from './commerce.query'
import searchQuery from './search.query'
import userQuery from './user.query'
import preoderQuery from './preorder.query'
import depositQuery from './deposit.query'
import organizationQuery from './organization.query'

export default {
  ...commerceQuery,
  ...searchQuery,
  ...preoderQuery,
  ...userQuery,
  ...depositQuery,
  ...organizationQuery
}
