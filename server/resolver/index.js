import { GraphQLScalarType } from 'graphql'
import { GraphQLUpload } from 'apollo-server-express'
import { Kind } from 'graphql/language'
import { CommerceService, SearchService } from '@/service'
import moment from 'moment'
import { UserService, PreorderService, BeneficiaryService } from '../service'
import { Roles, validate } from '@/util/requireRole'

const resolvers = {
  Upload: GraphQLUpload,
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
    userSignUp: async (parent, { user }) => {
      const emailSuggested = user.emailSuggested
      const response = await UserService.signup(user)
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
    userFbSignUp: async (parent, { user }) => {
      const emailSuggested = user.emailSuggested
      const response = await UserService.fbSignup(user)
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
    async preOrderAssignment (parent, { file }) {
      console.log('file: ', file)
      const { stream, filename, mimetype, encoding } = await file
      stream.on('data', (chunk) => { console.log(chunk.toString()) })

      // 1. Validate file metadata.

      // 2. Stream file contents into local filesystem or cloud storage:
      // https://nodejs.org/api/stream.html

      // 3. Record the file upload in your DB.
      // const id = await recordFile( … )

      return { stream, filename, mimetype, encoding }
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
