// import config from '@/config/environment'
// import trae from '@/util/trae'
import { Logger, Email } from 'pu-common'
// import stream from 'stream'
import randomstring from 'randomstring'
import csv from 'fast-csv'
import { Parser as Json2csvParser } from 'json2csv'
import { UserService, OrganizationService, PreorderService } from '@/service'
import config from '@/config/environment'
import ZendeskService from '@/util/zendesk'
import sqs from 'sqs'
import { MongoClient } from 'mongodb'

const queue = sqs(config.sqs.credentials)
const email = new Email(config.email.options)
let collection
MongoClient.connect(config.mongo.url, (err, cli) => {
  const client = cli
  if (err) return console.log('err: ', err)
  collection = client.db(config.mongo.db).collection(config.mongo.prefix + 'preorder_assinment')
  console.log('connected db')
  pull()
})

async function pull () {
  queue.pull(config.sqs.queueName, config.sqs.workers, function (row, callback) {
    row.id = randomstring.generate(5) + new Date().getTime()
    collection.insertOne(row, (err, response) => {
      if (err) {
        Logger.error('err')
        return callback()
      }
      const doc = response.ops[0]
      signup(doc).then(message => message)
        .then(() => {
          return createBeneficiary(doc)
        }).then(beneficiary => {
          return createPreorder(doc, beneficiary)
        }).then(po => {
          return zdUserCreateOrUpdate(doc, po)
        })
        .then(po => {
          return zdTicketsCreate(doc, po)
        })
        .then(message => {
          callback()
        })
        .catch(reason => {
          Logger.error('preorder assignment error pull row: ' + reason.message)
          updateRecord(row.id, JSON.parse(reason.message))
          callback()
        })
    })
  })
}

function updateRecord (id, values, chain) {
  return new Promise((resolve, reject) => {
    collection.findOneAndUpdate({ id }, { $set: values, $inc: {__v: 1} }, (err, result) => {
      if (err) {
        Logger.error('preorder assignment error update row: ' + JSON.stringify(err))
        return reject(err)
      }
      Logger.info(`preorder assignment update row id: ${id}, values ${JSON.stringify(values)}`)
      if (chain) resolve(chain)
      resolve(result)
    })
  })
}

function replaceText (values, text) {
  Object.keys(values).forEach(key => {
    text = text.replace(new RegExp('{{' + key + '}}', 'g'), values[key])
  })
  return text
}

function signup (row) {
  return UserService.signup({
    firstName: row.parentFirstName,
    lastName: row.parentLastName,
    email: row.parentEmail,
    phone: row.parentPhoneNumber
  }).then(user => {
    const userStatus = user.message ? 'Parent exists.' : 'Parent added.'
    Logger.info(`preorder assignment signup row id: ${row.id}, userStatus ${userStatus}`)
    return updateRecord(row.id, { userStatus })
  }).catch(reason => {
    throw new Error(JSON.stringify({userStatus: reason.message}))
  })
}

function createBeneficiary (row, beneficiary) {
  if (!row.organization) {
    throw new Error({beneficiaryStatus: 'organization does not exist'})
  }
  return OrganizationService.createBeneficiary({
    organizationId: row.organization._id,
    organizationName: row.organization.businessName,
    firstName: row.beneficiaryFirstName,
    lastName: row.beneficiaryLastName,
    assigneesEmail: row.parentEmail}).then(beneficiaryResult => {
    Logger.info(`preorder assignment create beneficiary row id: ${row.id}, beneficiaryStatus ${beneficiaryResult.message}`)
    return updateRecord(row.id, {beneficiaryStatus: beneficiaryResult.message}, beneficiaryResult.beneficiary)
  }).catch(reason => {
    throw new Error(JSON.stringify({beneficiaryStatus: reason.message}))
  })
}

function createPreorder (row, beneficiary) {
  if (!row.plan) {
    throw new Error({preorderStatus: 'Payment plan does not exist'})
  }
  if (!row.product) {
    throw new Error({preorderStatus: 'Product does not exist'})
  }

  try {
    const entity = {
      organizationId: row.product.organizationId,
      productId: row.product._id,
      productName: row.product.name,
      beneficiaryId: beneficiary._id,
      planId: row.plan._id,
      planGroupId: row.plan.groupId,
      season: row.product.season,
      credits: row.plan.credits,
      dues: row.plan.dues,
      assigneeEmail: row.parentEmail,
      status: 'active'
    }
    return PreorderService.create(entity).then(po => {
      row.preorderResult = 'Preorder added'
      row.preOrderId = po._id
      Logger.info(`preorder assignment create preorder row id: ${row.id}, preorderStatus: Preorder added`)
      return updateRecord(row.id, {preorderStatus: 'Preorder added', preOrderId: po._id}, po)
    }).catch(reason => {
      throw new Error(JSON.stringify({preorderStatus: reason.message}))
    })
  } catch (error) {
    throw new Error(JSON.stringify({preorderStatus: error.message}))
  }
}

function zdUserCreateOrUpdate (row, po) {
  return ZendeskService.userCreateOrUpdate({
    email: row.parentEmail,
    name: row.parentFirstName + ' ' + row.parentLastName,
    phone: row.parentPhoneNumber,
    organization: { name: row.organizationName },
    beneficiary: row.beneficiaryFirstName + ' ' + row.beneficiaryLastName,
    product: row.product.name
  }).then(res => {
    Logger.info(`preorder assignment create zd user row id: ${row.id}, preorderStatus: parent added`)
    return updateRecord(row.id, {zdCreateUserStatus: 'parent added'}, po)
  }).catch(reason => {
    throw new Error(JSON.stringify({zdCreateUserStatus: reason.message}))
  })
}

function zdTicketsCreate (row, po) {
  try {
    const cfBalance = po.dues.reduce((curr, due) => {
      return curr + due.amount
    }, 0)
    ZendeskService.ticketsCreate({
      preorderId: po._id,
      subject: replaceText(row, row.subject),
      comment: replaceText(row, row.comment),
      status: row.ticketStatus,
      requesterEmail: row.parentEmail,
      requesterName: row.parentFirstName + '' + row.parentLastName,
      ticketAssignee: row.ticketAssignee,
      ticketPriority: row.ticketPriority,
      cfBalance,
      cfTicketReasonCategory: row.cfTicketReasonCategory,
      ticketTags: row.ticketTags,
      isPublic: row.isPublic
    }).then(res => {
      Logger.info(`preorder assignment create zd ticket row id: ${row.id}, preorderStatus: ticket created`)
      return updateRecord(row.id, {zdTicketsCreateStatus: 'ticket created'})
    }).catch(reason => {
      throw new Error(JSON.stringify({zdTicketsCreateStatus: reason.message}))
    })
  } catch (error) {
    throw new Error(JSON.stringify({zdTicketsCreateStatus: error.message}))
  }
}

export default class PreorderAssignmentService {
  static async push (fileName, stream, subject, comment, user) {
    let mapOrganizations = await OrganizationService.mapNameOrganizations()
    Logger.info('mapOrganizations: ' + Object.keys(mapOrganizations).length)
    let mapPlans = await OrganizationService.mapPlans()
    Logger.info('mapPlans: ' + Object.keys(mapPlans).length)
    let mapProducts = await OrganizationService.mapProducts()
    Logger.info('mapProducts: ' + Object.keys(mapProducts).length)
    const chapUserEmail = user.email

    try {
      csv
        .fromStream(stream, {headers: true})
        .transform((row, next) => {
          const rowPush = {
            chapUserEmail,
            subject,
            comment,
            user,
            beneficiaryFirstName: row.beneficiaryFirstName,
            beneficiaryLastName: row.beneficiaryLastName,
            parentFirstName: row.parentFirstName,
            parentLastName: row.parentLastName,
            parentPhoneNumber: row.parentPhoneNumber,
            organizationName: row.organization,
            organization: mapOrganizations[row.organization],
            paymentPlanId: row.paymentPlanId,
            ticketStatus: row.ticketStatus,
            ticketAssignee: row.ticketAssignee,
            ticketPriority: row.ticketPriority,
            cfTicketReasonCategory: row.cfTicketReasonCategory,
            isPublic: row.isPublic,
            ticketTags: row.ticketTags ? row.ticketTags.split('|') : [],
            parentEmail: row.parentEmail.toLowerCase(),
            plan: mapPlans[row.paymentPlanId] || null,
            product: mapPlans[row.paymentPlanId] ? mapProducts[mapPlans[row.paymentPlanId].productId] : null
          }
          next(null, rowPush)
        })
        .on('data', (data) => {
          try {
            queue.push(config.sqs.queueName, data, (err1, msg) => {
              if (err1) return Logger.error('PreorderAssignmentService push error: ' + err1)
              // Logger.info('PreorderAssignmentService push result: ' + JSON.stringify(data))
            })
          } catch (reason) {
            // Logger.error('PreorderAssignmentService catch push: ' + reason)
          }
        })
        .on('end', () => {
          Logger.info('End push file: ' + fileName)
        })
    } catch (error) {
      Logger.error('singup error: ' + JSON.stringify(error))
    }
  }

  static async bulk (fileName, stream, subject, comment, user) {
    let mapOrganizations = await OrganizationService.mapNameOrganizations()
    Logger.info('mapOrganizations: ' + Object.keys(mapOrganizations).length)
    let mapPlans = await OrganizationService.mapPlans()
    Logger.info('mapPlans: ' + Object.keys(mapPlans).length)
    let mapProducts = await OrganizationService.mapProducts()
    Logger.info('mapProducts: ' + Object.keys(mapProducts).length)
    const chapUserEmail = user.email
    let result = []
    try {
      csv
        .fromStream(stream, {headers: true})
        .transform((row, next) => {
          const ticketTags = row.ticketTags ? row.ticketTags.split('|') : []
          const parentEmail = row.parentEmail.toLowerCase()
          const {
            beneficiaryFirstName,
            beneficiaryLastName,
            parentFirstName,
            parentLastName,
            parentPhoneNumber,
            organization,
            paymentPlanId,
            ticketStatus,
            ticketAssignee,
            ticketPriority,
            cfTicketReasonCategory,
            isPublic
          } = row
          // Logger.info('Row: ' + JSON.stringify(row))
          UserService.signup({firstName: parentFirstName, lastName: parentLastName, email: parentEmail, phone: parentPhoneNumber}).then(user => {
            if (user.message) {
              row.parentResult = 'Parent exists.'
            } else {
              row.parentResult = 'Parent added.'
            }
            const organizationObj = mapOrganizations[organization]
            if (!organizationObj) {
              row.beneficiaryResult = 'Invalid organization.'
              return next(null, row)
            }
            OrganizationService.createBeneficiary({organizationId: organizationObj._id,
              organizationName: organizationObj.businessName,
              firstName: beneficiaryFirstName,
              lastName: beneficiaryLastName,
              assigneesEmail: parentEmail}).then(beneficiaryResult => {
              Logger.info('beneficiaryResult: ' + JSON.stringify(beneficiaryResult))
              row.beneficiaryResult = beneficiaryResult.message
              const plan = mapPlans[paymentPlanId]

              if (!plan) {
                row.preorderResult = 'Payment plan does not exist'
                return next(null, row)
              }

              const cfBalance = plan.dues.reduce((curr, due) => {
                return curr + due.amount
              }, 0)
              const product = mapProducts[plan.productId]
              if (!product) {
                row.preorderResul = 'Product does not exist'
                return next(null, row)
              }

              const entity = {
                organizationId: product.organizationId,
                productId: product._id,
                productName: product.name,
                beneficiaryId: beneficiaryResult.beneficiary._id,
                planId: plan._id,
                planGroupId: plan.groupId,
                season: product.season,
                credits: plan.credits,
                dues: plan.dues,
                assigneeEmail: parentEmail,
                status: 'active'
              }
              PreorderService.create(entity).then(po => {
                row.preorderResult = 'Preorder added'
                row.preOrderId = po._id

                ZendeskService.userCreateOrUpdate({
                  email: parentEmail,
                  name: parentFirstName + ' ' + parentLastName,
                  phone: parentPhoneNumber,
                  organization: { name: organization },
                  beneficiary: beneficiaryFirstName + ' ' + beneficiaryLastName,
                  product: product.name
                }).then(res => {
                  row.zendeskParentInsertResult = 'parent added'
                  ZendeskService.ticketsCreate({
                    preorderId: po._id,
                    subject: replaceText(row, subject),
                    comment: replaceText(row, comment),
                    status: ticketStatus,
                    requesterEmail: parentEmail,
                    requesterName: parentFirstName + '' + parentLastName,
                    ticketAssignee,
                    ticketPriority,
                    cfBalance,
                    cfTicketReasonCategory,
                    ticketTags,
                    isPublic
                  }).then(res => {
                    row.zendeskTicketResult = 'ticket created'
                    return next(null, row)
                  }).catch(reason => {
                    Logger.error('zd ticktet result: ' + JSON.stringify(reason))
                    row.zendeskTicketResult = 'ticket failed'
                    return next(null, row)
                  })
                }).catch(reason => {
                  Logger.error('zd parent insert: ' + JSON.stringify(reason))
                  row.zendeskParentInsertResult = 'parent failed'
                  return next(null, row)
                })
              }).catch(reason => {
                Logger.error('po result: ' + JSON.stringify(reason))
                row.preorderResult = reason.toString()
                return next(null, row)
              })
            }).catch(reason => {
              Logger.error('Create beneficiary result: ' + JSON.stringify(reason))
              row.beneficiaryResult = reason.toString()
              return next(null, row)
            })
          }).catch(reason => {
            row.parentResult = reason.toString()
            return next(null, row)
          })
        })
        .on('data', (data) => {
          result.push(data)
        })
        .on('end', () => {
          const fields = [
            'beneficiaryFirstName',
            'beneficiaryLastName',
            'parentEmail',
            'parentFirstName',
            'parentLastName',
            'parentPhoneNumber',
            'organization',
            'paymentPlanId',
            'ticketStatus',
            'ticketTags',
            'ticketAssignee',
            'ticketPriority',
            'cfTicketReasonCategory',
            'isPublic',
            'preOrderId',
            'parentResult',
            'beneficiaryResult',
            'preorderResult',
            'zendeskParentInsertResult',
            'zendeskTicketResult'
          ]
          const json2csvParser = new Json2csvParser({ fields })
          const csv = json2csvParser.parse(result)
          const attachment = {
            content: Buffer.from(csv).toString('base64'),
            fileName: 'Result - ' + fileName,
            type: 'application/octet-stream'
          }
          email.sendEmail(chapUserEmail, 'Preorder Assignment Result', 'Hi,<br> The preorder assignment result was attached', [attachment])
        })
    } catch (error) {
      Logger.error('singup error: ' + JSON.stringify(error))
    }
  }
}
