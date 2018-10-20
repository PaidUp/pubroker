module.exports = `
  # This is an Beneficiary
  type Beneficiary {
    # mongo Id
    _id: ID
    # generated id
    organizationId: String
    organizationName: String
    type: String
    firstName: String
    lastName: String
    description: String
    assigneesEmail: [String]
    status: String
    
  }
`
