import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { CommerceService, SearchService } from '@/service'
import moment from 'moment'
import UserService from '../service/user.service'
import {coach} from '@/util/requireRole'

const resolvers = {
  Query: {
    invoices: (_, args) => {
      return CommerceService.invoices(args.organizationId, args.seasonId)
    },
    payments: coach((_, args) => {
      return CommerceService.payments(args.organizationId, args.seasonId)
    }),
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
  Mutation: {
    userSignUp: (_, args) => {
      return UserService.signup(args.user).then(user => {
        if (user.message) {
          throw new Error(user.message)
        }
        return user
      }).catch(reason => {
        throw new Error(reason)
      })
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
