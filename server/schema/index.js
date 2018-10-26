import { FileType, Beneficiary, Invoice, User, SearchResult, Preorder, Credit, Payment } from './typeDefs'
import { makeExecutableSchema } from 'apollo-server-express'
import mutation from './mutation'
import query from './query'
import scalar from './scalar'
import union from './union'
const resolvers = require('../resolver')

const rootQuery = `
  ${scalar}
  
  ${union}

  ${query}

  ${mutation}  

`

const schema = makeExecutableSchema({
  typeDefs: [rootQuery, Invoice, Payment, Beneficiary, User, SearchResult, Preorder, Credit, FileType],
  resolvers
})

module.exports = schema
