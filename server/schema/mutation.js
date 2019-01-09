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

const commerceBeneficiaryMutations = `
  createBeneficiary(organizationId: String!, organizationName: String!, firstName: String!, lastName: String!, assigneesEmail: [String], description: String, programs: String): Beneficiary!
  updateBeneficiary(id: String!, firstName: String, lastName: String, assigneesEmail: [String], description: String): Beneficiary!
  deleteBeneficiary(id: String!): Boolean
`

const paymentMutations = `
  verifySource(customerId: String!, sourceId: String!, amounts: [Int!]): Source!
`
export default `
type Mutation {
  ${miscellaneousMutations}
  ${userMutations}
  ${commerceMutations}
  ${commerceBeneficiaryMutations}
  ${paymentMutations}
}
`
