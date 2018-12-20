import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { GraphQLUpload } from 'apollo-server-express'
import moment from 'moment-timezone'

const formatStr = 'MM/DD/YYYY'

export const Upload = GraphQLUpload
export const Date = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue (value) {
    return new Date(value) // value from the client
  },
  serialize (value) {
    if (!value) return null
    if (typeof value === 'number') return moment.unix(value).format(formatStr)
    return moment(value).format(formatStr)
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value) // ast value is always in string format
    }
    return null
  }
})

export const Result = {
  __resolveType: (obj) => {
    if (obj.nombre) return 'Profesor'
    return 'Curso'
  }
}
