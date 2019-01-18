const miscellaneousMutations = `
  validateUrl(url: String!): String
`

const userMutations = `
  userCreate(beneficiaryId: String, user: NewUser!): User!
  userUpdate(id: String!, values: UpdateUser!): User!
  userSignUp(user: NewUser!): SignUpResult
  userFbSignUp(user: NewFbUser!): SignUpResult
`

const commerceMutations = `
  preOrderAssignment(file: Upload!, subject: String!, comment: String!): File!
  importCredits(file: Upload!): File!
`

const organizationBeneficiaryMutations = `
  createBeneficiary(organizationId: String!, organizationName: String!, firstName: String!, lastName: String!, assigneesEmail: [String], description: String, programs: String): Beneficiary!
  updateBeneficiary(id: String!, firstName: String, lastName: String, assigneesEmail: [String], description: String): Beneficiary!
  deleteBeneficiary(id: String!): Boolean
`

const organizationPlansMutations = `
  createPaymentPlan(key: String!, groupId: String!, description: String!, paymentMethods: [String], visible: Boolean, status: String!, credits: [NewPaymentPlanCredits], dues: [NewPaymentPlanDues], productId: String!): PaymentPlan!
`

const paymentMutations = `
  verifySource(customerId: String!, sourceId: String!, amounts: [Int!]): Source!
`
export default `
type Mutation {
  ${miscellaneousMutations}
  ${userMutations}
  ${commerceMutations}
  ${organizationBeneficiaryMutations}
  ${paymentMutations}
  ${organizationPlansMutations}
}
`
