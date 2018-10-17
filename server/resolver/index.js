import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { CommerceService, SearchService } from '@/service'
import moment from 'moment'

const resolvers = {
  Query: {
    invoices: (_, args) => {
      return CommerceService.invoices(args.organizationId, args.seasonId)
    },
    payments: (_, args) => {
      return CommerceService.payments(args.organizationId, args.seasonId)
    },
    search: (_, args) => {
      return SearchService.exec(args.criteria)
    }
  },
  Result: {
    __resolveType: (obj) => {
      if (obj.nombre) return 'Profesor'
      return 'Curso'
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue (value) {
      return new Date(value) // value from the client
    },
    serialize (value) {
      return moment(value).format('MM/DD/YYYY')
    },
    parseLiteral (ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null
    }
  })
}

module.exports = resolvers
