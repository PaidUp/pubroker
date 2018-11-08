export default `
  type Payout {
    _id: String!
    id: String!
    amount: Int!
    arrival_date: Int!
    balance_transaction: BalanceTransaction
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
