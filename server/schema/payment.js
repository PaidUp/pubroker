module.exports = `
  # This is an Payment Report 
  type Payment {
    # generated id
    receiptId: String
    type: String!
    chargeDate: Date
    receiptDate: Date
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
    tags: [String]
  }
`
