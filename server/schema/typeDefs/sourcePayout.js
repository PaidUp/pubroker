export default `
  type SourcePayout {
    id: String!
    object: String
    amount: Int
    amount_refunded: Int
    created: Int
    currency: String
    source_transfer: SourceTransfer!
  }
`
