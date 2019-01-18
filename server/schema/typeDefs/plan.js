export default `
  # This is an PlanReduced
  type PlanReduced {
    # mongo Id
    id: ID
    description: String
    amount: Float
    installments: Int
    startCharge: String
    endCharge: String
  }

  type PaymentPlanDues {
    _id: ID
    description: String!
    dateCharge: String!
    maxDateCharge: String
    amount: Float!
    status: String!
  }

  type PaymentPlanCredits {
    _id: ID
    description: String!
    dateCharge: String!
    amount: Float!
    status: String!
  }

  type PaymentPlan {
    _id: ID
    key: String!
    groupId: String!
    description: String!
    paymentMethods: [String]
    visible: Boolean
    status: String!
    credits: [PaymentPlanCredits]
    dues: [PaymentPlanDues]
    productId: String
  }

  input NewPaymentPlanDues {
    description: String!
    dateCharge: String!
    maxDateCharge: String!
    amount: Float!
    status: String!
  }

  input NewPaymentPlanCredits {
    description: String!
    dateCharge: String!
    amount: Float!
    status: String!
  }
`
