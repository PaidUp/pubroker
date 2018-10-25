import file from './typeDefs/file'
import { makeExecutableSchema } from 'apollo-server-express'
const resolvers = require('../resolver')
const Invoice = require('./invoice')
const Beneficiary = require('./beneficiary')
const Payment = require('./payment')
const User = require('./user')
const SearchResult = require('./searchResult')
const Preorder = require('./preorder')
const Credit = require('./credit')

const rootQuery = `
  scalar Upload
  scalar Date
  
  union Result = Invoice | Beneficiary

  type Query {
    invoices(organizationId: String!, seasonId: String!): [Invoice]
    payments(organizationId: String!, seasonId: String!): [Payment]
    search(criteria: String!): SearchResult
  }

  type Mutation {
    userSignUp(user: NewUser): SignUpResult
    userFbSignUp(user: NewFbUser): SignUpResult
    preOrderAssignment(file: Upload!): File!
  }

`

const schema = makeExecutableSchema({
  typeDefs: [rootQuery, Invoice, Payment, Beneficiary, User, SearchResult, Preorder, Credit, file],
  resolvers
})

module.exports = schema
