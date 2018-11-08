export default `
  type DestinationPayment {
    id: String!
    object: String!
    amount: Int!
    amount_refunded: Int!
    created: Int!
    currency: String!
    refunded: Boolean!
    status: String
  }
`
