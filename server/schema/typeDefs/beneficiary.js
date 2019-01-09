export default `
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
    programs: [String]
  }

  type BeneficiaryParentInfo {
    beneficiaryFirstName: String
    beneficiaryLastName: String
    parentFirstName: String
    parentLastName: String
    parentEmail: String
  }
`
