export default `
  type Transfer {
    _id: String!
    id: String!
    amount: Int!
    amount_reversed: Int!
    balance_transaction: BalanceTransaction!
    created: Int!
    currency: String!
    destination: String!
    destination_payment: DestinationPayment!
    object: String!
    reversed: Boolean!
    source_transaction: SourceTransaction
    source_type: String!
  }
`
