import { Logger } from 'pu-common'
import randomstring from 'randomstring'
import csv from 'fast-csv'
import { UserService, OrganizationService, PreorderService } from '@/service'
import config from '@/config/environment'
import ZendeskService from '@/util/zendesk'
import sqs from 'sqs'
import Mongo from '@/util/mongo'

const queue = sqs(config.sqs.credentials)
let collection
let fileCollection

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
    return updateRecord(row.id, { status: 'processing', userStatus })
  }).catch(reason => {
    throw new Error(JSON.stringify({userStatus: reason.message}))
  })
}

function createBeneficiary (row, beneficiary) {
  if (!row.organization) {
    throw new Error(JSON.stringify({beneficiaryStatus: 'organization does not exist'}))
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
    throw new Error(JSON.stringify({preorderStatus: 'Payment plan does not exist'}))
  }
  if (!row.product) {
    throw new Error(JSON.stringify({preorderStatus: 'Product does not exist'}))
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
      return updateRecord(row.id, {status: 'done', zdTicketsCreateStatus: 'ticket created'})
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
    const keyFile = randomstring.generate(12) + new Date().getTime()
    let rowNum = 0
    try {
      csv
        .fromStream(stream, {headers: true})
        .transform((row, next) => {
          row.status = 'pending'
          row.row = ++rowNum
          row.keyFile = keyFile
          row.chapUserEmail = chapUserEmail
          row.subject = subject
          row.comment = comment
          row.organizationName = row.organization
          row.organization = mapOrganizations[row.organizationName]
          row.ticketTags = row.ticketTags ? row.ticketTags.split('|') : []
          row.parentEmail = row.parentEmail.toLowerCase()
          row.plan = mapPlans[row.paymentPlanId] || null
          row.product = mapPlans[row.paymentPlanId] ? mapProducts[mapPlans[row.paymentPlanId].productId] : null
          row.createOn = new Date()

          next(null, row)
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
          fileCollection.insertOne({
            rows: rowNum,
            keyFile,
            fileName,
            user: chapUserEmail,
            onUpload: new Date()
          }, (err, response) => {
            if (err) Logger.critical(err.message)
          })
        })
    } catch (error) {
      Logger.error('singup error: ' + JSON.stringify(error))
    }
  }

  static getRowsByFile (keyFile) {
    return new Promise((resolve, reject) => {
      collection.find({ keyFile }).sort({ row: 1 }).toArray((err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }

  static getFilesByUser (user) {
    return new Promise((resolve, reject) => {
      fileCollection.find({ user }).sort({ onUpload: -1 }).toArray((err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }
}

export const pull = function () {
  Logger.info('preorder assignment pull invoked')
  collection = Mongo.getCollection('preorder_assinment_row')
  fileCollection = Mongo.getCollection('preorder_assinment_file')
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
          let message
          try {
            message = JSON.parse(reason.message)
            message.status = 'faild'
          } catch (error) {
            message = {status: 'faild', error: reason.message}
          }
          updateRecord(row.id, message).catch(reason => {
            Logger.critical(reason.message)
          })
          callback()
        })
    })
  })
}
