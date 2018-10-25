/**
 * Express configuration
 */

import compression from 'compression'
import bodyParser from 'body-parser'
// import methodOverride from 'method-override'
// import cookieParser from 'cookie-parser'
/// import morgan from 'morgan'
// import errorhandler from 'errorhandler'
import cors from 'cors'
import pmx from 'pmx'

export default function (app) {
  app.use(cors())
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(pmx.expressErrorHandler())
}
