module.exports = `
  # This is an Invoice
  type Invoice {
    # mongo Id
    id: ID!
    # generated id
    invoiceId: String!
    label: String!
    organizationId: String!
    organizationName: String!
    productId: String!
    productName: String!
    beneficiaryId: String!
    beneficiaryFirstName: String!
    beneficiaryLastName: String!
    season: String!
    connectAccount: String!
    dateCharge: Date!
    maxDateCharge: Date
    price: Float!
    priceBase: Float!
    paidupFee: Float!
    stripeFee: Float!
    totalFee: Float!
    notes: [String]
    user: User!
    processingFees: ProcessingFees!
    paymentDetails: PaymentDetails!
    payFees: PayFees!
    attempts: Attempts
    tags: [String]
    status: Status!
  }

  type User {
    userFirstName: String!
    userLastName: String!
    userEmail: String!
  }

  type ProcessingFees {
    cardFee: Float!
    cardFeeFlat: Float!
    achFee: Float!
    achFeeFlat: Float!
    achFeeCap: Float!
  }

  type PaymentDetails {
    externalCustommerId: String!
    statementDescriptor: String!
    paymentMethodtype: PaymentMethodtype!
    externalPaymentMethodId: String!
    brand: String!
    last4: String!
  }

  type PayFees {
    collections: Boolean!,
    processing: Boolean!
  }

  type Attempts {
    object: String
    created: Date
    status: String
  }

  enum PaymentMethodtype {
    card
    bank_account
  }

  enum Status {
    paidup
    autopay
    failed
  }
`
