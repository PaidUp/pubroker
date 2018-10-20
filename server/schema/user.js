module.exports = `
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
`
