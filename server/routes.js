import api from '@/api'
import { auth } from 'pu-common'
import { ApolloServer } from 'apollo-server-express'
import schema from './schema'

const path = '/graphql'

function createApolloServer (app) {
  const server = new ApolloServer({
    playground: app.get('env') !== 'production',
    schema,
    context: ({req, res}) => ({
      user: req.user
    })})
  server.applyMiddleware({ app, path })
}

export default function (app) {
  app.use(path, auth.populateUser)
  createApolloServer(app)
  app.use('/api/v1/broker', api)
  app.route('/*').get(function (request, response) {
    response.status(200).json({ PU: 'Broker!!!' })
  })
}
