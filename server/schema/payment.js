module.exports = `
  # This is an Payment Report 
  type Payment {
    # generated id
    invoiceId: String
    type: String!
    chargeDate: Date
    invoiceDate: Date
    description: String!
    program: String!
    status: String
    parentName: String!
    parentEmail: String!
    playerName: String!
    amount: Float
    refund: Float
    processingFee: Float
    paidupFee: Float
    totalFee: Float
  }
`
