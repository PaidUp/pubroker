export default `
  # This is an Invoice
  type Preorder {
    # mongo Id
    _id: ID!
    # generated id
    organizationId: String
    productId: String
    productName: String
    season: String
    beneficiaryId: String
    planId: String
    planGroupId: String
    assigneeEmail: String
    dues: [DuesPreorder]
    credits: [CreditsPreorder]
    status: String
  }

  type DuesPreorder {
    description: String
    dateCharge: Date
    maxDateCharge: Date
    tags: [String]
    amount: Float
  }

  type CreditsPreorder {
    description: String
    dateCharge: Date
    amount: Float
    tags: [String]
    status: String
  }
`
