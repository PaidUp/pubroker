export default `
  type DepositBalanceReportResponse {
    invoiceId: String!
    invoiceDate: Date
    chargeDate: Date
    processed: Float
    processingFee: Float
    paidupFee: Float
    totalFee: Float
    netDeposit: Float
    adjustment: Float
    description: String
    program: String
    parentName: String
    playerName: String
    tags: [String]
    index: String
  }
`
