const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('../resolver')
const Invoice = require('./Invoice')
const Payment = require('./Payment')

const rootQuery = `
  scalar Date
  
  union ResultadoBusqueda = Invoice

  type Query {
    invoices(organizationId: String!, seasonId: String!): [Invoice]
    payments(organizationId: String!, seasonId: String!): [Payment]
    buscar(query: String!): [ResultadoBusqueda]
  }

`

const schema = makeExecutableSchema({
  typeDefs: [rootQuery, Invoice, Payment],
  resolvers
})

module.exports = schema
