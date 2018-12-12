export default `
type Query {
  invoices(organizationId: String!, seasonId: String!): [Invoice]
  payments(organizationId: String!, seasonId: String!): [Payment]
  search(criteria: String!): SearchResult
  getUsersByEmails(emails: [String]!): [User]
  preorderAssignmentFiles(email: String): [FilePreorder]
  preorderAssignmentRows(keyFile: String): [RowPreorder]
  fetchBalanceHistory(account: String!, payout: String!,): [DepositBalanceReportResponse]!
  fetchPayouts(account: String!, limit: Int, startingAfter: String, endingBefore: String): PayoutResponse!
}
`
