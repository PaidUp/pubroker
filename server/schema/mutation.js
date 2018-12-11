export default `
type Mutation {
  userCreate(beneficiaryId: String, user: NewUser!): User!
  userUpdate(id: String!, values: UpdateUser!): User!
  userSignUp(user: NewUser!): SignUpResult
  userFbSignUp(user: NewFbUser!): SignUpResult
  preOrderAssignment(file: Upload!, subject: String!, comment: String!): File!
  importCredits(file: Upload!): File!
  validateUrl(url: String!): String!
  verifySource(customerId: String!, sourceId: String!, amounts: [Int!]): Source!
}
`
