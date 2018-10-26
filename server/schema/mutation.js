export default `
type Mutation {
  userSignUp(user: NewUser): SignUpResult
  userFbSignUp(user: NewFbUser): SignUpResult
  preOrderAssignment(file: Upload!, subject: String!, comment: String!): File!
}
`
