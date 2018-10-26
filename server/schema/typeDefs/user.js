export default `
  # This is an User
  type User {
    # mongo Id
    _id: ID
    # generated id
    firstName: String
    lastName: String
    birthDate: Date
    email: String
    type: TypeUser
    facebookId: String
    organizationId: String
    externalCustomerId: String
    phone: String
    contacts: [Contact]
    roles: [Roles]
  }

  type Contact {
    label: String
    phone: Date
    address1: String
    address2: String
    city: String
    state: String
    country: String
    zipCode: String
  }

  type SignUpResult {
    token: String!
    user: User!
  }

  enum Roles {
    parent
    coach
    chap
  }

  enum TypeUser {
    customer
    functionary
    organization
    api
    service 
  }

  input NewUser {
    firstName: String!
    lastName: String!
    email: String!
    emailSuggested: String
    phone: String
    type: String
    password: String
  }

  input NewFbUser {
    accessToken: String!
    rememberMe: Boolean
    emailSuggested: String!
    phone: String
  }
`
