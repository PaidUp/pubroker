export default `
  type SourceTransfer {
    id: String!
    object: String
    amount: Int
    amount_reversed: Int
    created: Int
    currency: String
    source_transaction: SourceTransaction
  }
`
