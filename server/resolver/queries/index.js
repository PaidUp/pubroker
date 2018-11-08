import { invoices, payments } from './commerce.query'
import { search } from './search.query'
import { getUsersByEmails } from './user.query'
import { preorderAssignmentFiles, preorderAssignmentRows } from './preorder.query'
import { fetchTransfers, fetchPayouts } from './deposit.query'

export default {
  invoices,
  payments,
  search,
  preorderAssignmentFiles,
  preorderAssignmentRows,
  getUsersByEmails,
  fetchTransfers,
  fetchPayouts
}
