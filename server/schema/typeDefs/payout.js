export default `
  type Payout {
    id: String!
    amount: Int!
    arrival_date: Int!
    balance_transaction: String
    created: Int!
    currency: String!
    description: String!
    destination: Source!
    object: String!
    source_type: String!
    status: String!
    type: String!
  }
`
