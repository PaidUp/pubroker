import typeDefs from './typeDefs'
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
  typeDefs: [rootQuery, ...typeDefs],
  resolvers
})

module.exports = schema
