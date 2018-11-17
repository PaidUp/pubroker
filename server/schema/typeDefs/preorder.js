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

  type FilePreorder {
    _id: String
    rows: Int!
    rowsFailed: Int
    keyFile: String!
    fileName: String!
    user: String!
    onUpload: Date!
  }

  type RowPreorder {
    _id: String
    status: String
    row: Int
    keyFile: String
    chapUserEmail: String
    subject: String
    comment: String
    beneficiaryFirstName: String
    beneficiaryLastName: String
    parentFirstName: String
    parentLastName: String
    parentPhoneNumber: String
    organizationName: String
    paymentPlanId: String
    ticketStatus: String
    ticketAssignee: String
    ticketPriority: String
    cfTicketReasonCategory: String
    isPublic: String
    ticketTags: [String]
    parentEmail: String
    createOn: Date
    userStatus: String
    beneficiaryStatus: String
    preorderStatus: String
    zdCreateUserStatus: String
    zdTicketsCreateStatus: String
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
