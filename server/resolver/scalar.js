import { GraphQLScalarType } from 'graphql'
import moment from 'moment'
import { Kind } from 'graphql/language'
import { GraphQLUpload } from 'apollo-server-express'

export const Upload = GraphQLUpload
export const Date = new GraphQLScalarType({
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

export const Result = {
  __resolveType: (obj) => {
    if (obj.nombre) return 'Profesor'
    return 'Curso'
  }
}
