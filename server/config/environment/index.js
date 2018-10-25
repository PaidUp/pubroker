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
