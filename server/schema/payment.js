module.exports = `
  # This is an Payment Report 
  type Payment {
    # generated id
    receiptId: String
    type: String!
    chargeDate: String
    receiptDate: String
    description: String!
    program: String!
    status: String
    parentName: String!
    parentEmail: String!
    parentPhone: String
    playerName: String!
    amount: Float
    refund: Float
    processingFee: Float
    paidupFee: Float
    totalFee: Float
    tags: [String]
    paymentMethodBrand: String
    paymentMethodLast4: String
    index: String!
  }
`
