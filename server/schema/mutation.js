export default `
type Mutation {
  userSignUp(user: NewUser): SignUpResult
  userFbSignUp(user: NewFbUser): SignUpResult
  preOrderAssignment(file: Upload!, subject: String!, comment: String!): File!
  importCredits(file: Upload!): File!
  validateUrl(url: String!): String!
}
`
