const SearchResult = `
type SearchResult {
  users: [User]
  beneficiaries: [Beneficiary]
  invoices: [Invoice],
  preorders: [Preorder],
  credits: [Credit]
}
`
module.exports = SearchResult
