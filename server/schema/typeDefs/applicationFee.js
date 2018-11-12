export default `
  type ApplicationFee {
    id: String!
    object: String!
    account: String!
    amount: Int!
    amount_refunded: Int!
    created: Int!
    currency: String!
    refunded: Boolean!
    status: String
    balance_transaction: BalanceTransaction
  }
`
