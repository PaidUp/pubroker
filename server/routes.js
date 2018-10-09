import cors from 'cors'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import schema from './schema'
import { auth } from 'pu-common'
import config from '@/config/environment'
import api from '@/api'

export default function (app) {
  app.use(cors())

  app.use('/graphql',
    auth.validate,
    graphqlExpress({ schema })
  )

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: `'x-api-key': '${config.api.key}'`
  }))

  app.use('/api/v1/organization', api)

  app.route('/*').get(function (request, response) {
    response.status(200).json({ PU: 'Broker!!!' })
  })
}
