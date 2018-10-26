export default `
  # This is an Credit
  type Credit {
    # mongo Id
    _id: ID
    # generated id
    memoId: String
    label: String
    description: String
    price: Float
    beneficiaryId: String
    assigneeEmail: String
    organizationId: String
    productId: String
    productName: String
    season: String,
    tags: [String]
    status: String
  }
`
