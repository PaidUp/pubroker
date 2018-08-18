// import cors from 'cors'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import schema from './schema'

export default function (app) {
  // app.use(cors())

  app.use('/graphql',
    graphqlExpress({ schema })
  )

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
  }))

  app.route('/*').get(function (request, response) {
    response.status(200).json({ PU: 'Broker!!!' })
  })
}
