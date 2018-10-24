import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { CommerceService, SearchService } from '@/service'
import moment from 'moment'
import { UserService, PreorderService, BeneficiaryService } from '../service'
import { Roles, validate } from '@/util/requireRole'

const resolvers = {
  Query: {
    invoices: validate([Roles.CHAP, Roles.API])((_, args) => {
      return CommerceService.invoices(args.organizationId, args.seasonId)
    }),
    payments: validate([Roles.COACH, Roles.API])((_, args) => {
      return CommerceService.payments(args.organizationId, args.seasonId)
    }),
    search: validate([Roles.CHAP, Roles.API])((_, args) => {
      return SearchService.exec(args.criteria)
    })
  },
  Result: {
    __resolveType: (obj) => {
      if (obj.nombre) return 'Profesor'
      return 'Curso'
    }
  },
  Mutation: {
    userSignUp: async (_, args) => {
      const emailSuggested = args.user.emailSuggested
      const response = await UserService.signup(args.user)
      if (response.message) {
        throw new Error(response.message)
      }
      if (emailSuggested && response.user.email !== emailSuggested) {
        await Promise.all([
          BeneficiaryService.updateAssigneesEmail(emailSuggested, response.user.email),
          PreorderService.updateMany(emailSuggested, response.user.email)
        ])
      }
      return response
    },
    userFbSignUp: async (_, args) => {
      const emailSuggested = args.user.emailSuggested
      const response = await UserService.fbSignup(args.user)
      if (response.message) {
        throw new Error(response.message)
      }
      if (emailSuggested && response.user.email !== emailSuggested) {
        await Promise.all([
          BeneficiaryService.updateAssigneesEmail(emailSuggested, response.user.email),
          PreorderService.updateMany(emailSuggested, response.user.email)
        ])
      }
      return response
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
