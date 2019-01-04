export default `
type PlayerSummary {
  id: ID!,
  firstName: String,
  lastName: String,
  total: Float,
  assigneesEmail: [String],
  paid: Float,
  unpaid: Float,
  overdue: Float,
  other: Float
}
`
