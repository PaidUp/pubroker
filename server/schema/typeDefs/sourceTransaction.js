export default `
  type SourceTransaction {
    id: String!
    object: String!
    amount: Int!
    amount_refunded: Int!
    created: Int!
    currency: String!
    customer: String!
    description: String!
    destination: String!
    metadata: SourceTransactionMetadata!
    on_behalf_of: String!
    paid: Boolean!
    source: SourceTransactionSource!
    statement_descriptor: String
    status: String
  }
`
