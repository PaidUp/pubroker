export default `
type Query {
  invoices(organizationId: String!, seasonId: String!): [Invoice]
  payments(organizationId: String!, seasonId: String!): [Payment]
  search(criteria: String!): SearchResult
  getUsersByEmails(emails: [String]!): [User]
  preorderAssignmentFiles(email: String): [FilePreorder]
  preorderAssignmentRows(keyFile: String): [RowPreorder]
  fetchTransfers(account: String!, arrival: Int!, source: String!): [Transfer]!
  fetchPayouts(account: String!): [Payout]!
}
`
