import _ from 'lodash'
import develop from './develop'
import production from './production'
import test from './test'
import stage from './stage'

const envs = {
  develop,
  production,
  test,
  stage
}

// All configurations will extend these options
// ============================================
let all = {
  port: process.env.PORT || 9005,
  auth: {
    credential: 'puproduct-secret',
    host: 'redis-13835.c16.us-east-1-3.ec2.cloud.redislabs.com',
    port: 13835,
    key: 'JF06f7FJjTDkNOcM1sdywWw5CZBHW4Jy'
  },
  logger: {
    projectId: 'gothic-talent-192920',
    logName: 'pu-broker-local-log',
    metadata: {resource: {type: 'global'}}
  },
  api: {
    key: 'JF06f7FJjTDkNOcM1sdywWw5CZBHW4Jy',
    user: 'http://localhost:9001/api/v1/user',
    payment: 'http://localhost:9004/api/v1/payment',
    organization: 'http://localhost:9002/api/v1/organization',
    commerce: 'http://localhost:9003/api/v1/commerce'
  },
  email: {
    options: {
      apiKey: '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',
      fromName: 'Support',
      fromEmail: 'support@getpaidup.com'
    }
  },
  zendesk: {
    username: 'ricardo@getpaidup.com',
    token: '6ON1frWgVv8acTGZNnabBMjj500JZA8vmGK2rNeb',
    subdomain: 'getpaidup1478060212',
    assigneeEmail: 'felipe@getpaidup.com',
    customFields: {
      preorderId: '360008982873',
      ticketReasonCategory: '48042408',
      balance: '56485848'
    }
  },
  mongo: {
    url: 'mongodb://pudevelop:xEbiMFBtX48ObFgC@pu-dev-shard-00-00-4nodg.mongodb.net:27017,pu-dev-shard-00-01-4nodg.mongodb.net:27017,pu-dev-shard-00-02-4nodg.mongodb.net:27017/develop?ssl=true&replicaSet=pu-dev-shard-0&authSource=admin',
    db: 'develop',
    prefix: 'pu_broker_'
  },
  sqs: {
    credentials: {
      access: 'AKIAJRCEYTHLPFLTZW6Q',
      secret: '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',
      region: 'us-east-1'
    },
    workers: 1,
    queueName: 'preorder-assignment-dev'
  }
}

if (process.env.NODE_ENV) {
  all = _.merge(
    all,
    envs[process.env.NODE_ENV] || {})
}

// Export the config object based on the NODE_ENV
// ==============================================
export default all
