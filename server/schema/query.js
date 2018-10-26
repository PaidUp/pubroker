export default `
type Query {
  invoices(organizationId: String!, seasonId: String!): [Invoice]
  payments(organizationId: String!, seasonId: String!): [Payment]
  search(criteria: String!): SearchResult
}
`
