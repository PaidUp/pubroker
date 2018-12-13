import { Logger } from 'pu-common'
import randomstring from 'randomstring'
// import csv from 'fast-csv'
import csv from 'csvtojson'
import { UserService, OrganizationService, PreorderService } from '@/service'
import ZendeskService from '@/util/zendesk'
import Mongo from '@/util/mongo'
import validator from 'email-validator'

function updateRecord (id, values, chain) {
  return new Promise((resolve, reject) => {
    Mongo.preoderAssignmentRowCollection.findOneAndUpdate({ id }, { $set: values, $inc: {__v: 1} }, (err, result) => {
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
  return new Promise((resolve, reject) => {
    if (!row.parentFirstName.trim().length) return reject(new Error(JSON.stringify({userStatus: 'parentFirstName is required'})))
    if (!row.parentFirstName.trim().length) return reject(new Error(JSON.stringify({userStatus: 'parentFirstName is required'})))
    if (!row.parentLastName.trim().length) return reject(new Error(JSON.stringify({userStatus: 'parentLastName is required'})))
    if (!validator.validate(row.parentEmail)) return reject(new Error(JSON.stringify({userStatus: 'parentEmail is invalid'})))
    UserService.signup({
      firstName: row.parentFirstName,
      lastName: row.parentLastName,
      email: row.parentEmail,
      phone: row.parentPhoneNumber,
      pendingSignup: true
    }).then(user => {
      const userStatus = user.message ? 'Parent exists.' : 'Parent added.'
      Logger.info(`preorder assignment signup row id: ${row.id}, userStatus ${userStatus}`)
      resolve(updateRecord(row.id, { status: 'processing', userStatus }))
    }).catch(reason => {
      throw new Error(JSON.stringify({userStatus: reason.message}))
    })
  })
}

function createBeneficiary (row) {
  if (!row.organization) throw new Error(JSON.stringify({beneficiaryStatus: 'organization does not exist'}))
  if (!row.beneficiaryFirstName.trim().length) throw new Error(JSON.stringify({beneficiaryStatus: 'beneficiaryFirstName is required'}))
  if (!row.beneficiaryLastName.trim().length) throw new Error(JSON.stringify({beneficiaryStatus: 'beneficiaryLastName is required'}))
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
  if (!row.plan) throw new Error(JSON.stringify({preorderStatus: 'Payment plan does not exist'}))
  if (!row.product) throw new Error(JSON.stringify({preorderStatus: 'Product does not exist'}))

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

function zdUserCreateOrUpdate (row, beneficiary) {
  if (!row.product) throw new Error(JSON.stringify({preorderStatus: 'Product does not exist'}))
  return ZendeskService.userCreateOrUpdate({
    email: row.parentEmail,
    name: row.parentFirstName + ' ' + row.parentLastName,
    phone: row.parentPhoneNumber,
    organization: { name: row.organizationName },
    beneficiary: row.beneficiaryFirstName + ' ' + row.beneficiaryLastName,
    product: row.product.name
  }).then(res => {
    Logger.info(`preorder assignment create zd user row id: ${row.id}, preorderStatus: parent added`)
    return updateRecord(row.id, {zdCreateUserStatus: 'parent added'}, beneficiary)
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
      cfPaymentLink: row.cfPaymentLink,
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

function saveFile (rowNum, keyFile, fileName, chapUserEmail) {
  return new Promise((resolve, reject) => {
    Mongo.preoderAssignmentFileCollection.insertOne({
      rows: rowNum,
      keyFile,
      fileName,
      user: chapUserEmail,
      onUpload: new Date()
    }, (err, response) => {
      if (err) {
        Logger.critical(err.message)
        reject(err)
      } else {
        Logger.info('Save push file: ' + fileName)
        resolve()
      }
    })
  })
}

function saveRow (row) {
  return new Promise((resolve, reject) => {
    Mongo.preoderAssignmentRowCollection.insertOne(row, (err, response) => {
      if (err) {
        Logger.error('Row failed insert: ' + err.reason)
        reject(err)
      } else {
        Logger.info('Row saved: ' + row.row)
        resolve(row)
      }
    })
  })
}

async function stringToJson (csvString, subject, comment, user) {
  let mapOrganizations = await OrganizationService.mapNameOrganizations()
  Logger.info('mapOrganizations: ' + Object.keys(mapOrganizations).length)
  let mapPlans = await OrganizationService.mapPlans()
  Logger.info('mapPlans: ' + Object.keys(mapPlans).length)
  let mapProducts = await OrganizationService.mapProducts()
  Logger.info('mapProducts: ' + Object.keys(mapProducts).length)
  const chapUserEmail = user.email
  const keyFile = randomstring.generate(12) + new Date().getTime()
  let rowNum = 0
  const jsonArr = await csv().fromString(csvString)
  const jsonArrDef = jsonArr.map(row => {
    row.createOn = new Date()
    row.id = randomstring.generate(5) + new Date().getTime()
    row.status = 'pending'
    row.row = ++rowNum
    row.keyFile = keyFile
    row.chapUserEmail = chapUserEmail
    row.subject = subject
    row.comment = comment
    row.organization = mapOrganizations[row.organizationName]
    row.ticketTags = row.ticketTags ? row.ticketTags.split('|') : []
    row.parentEmail = row.parentEmail ? row.parentEmail.toLowerCase() : ''
    row.plan = mapPlans[row.paymentPlanId] || null
    row.product = mapPlans[row.paymentPlanId] ? mapProducts[mapPlans[row.paymentPlanId].productId] : null
    return row
  })
  return {
    rowNum,
    keyFile,
    rows: jsonArrDef
  }
}

export default class PreorderAssignmentService {
  static async push (fileName, csvString, subject, comment, user) {
    const {rowNum, keyFile, rows} = await stringToJson(csvString, subject, comment, user)
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]
      await saveRow(row)
    }
    await saveFile(rowNum, keyFile, fileName, user.email)
    await executeBulk(rows)
  }

  static getRowsByFile (keyFile) {
    return new Promise((resolve, reject) => {
      Mongo.preoderAssignmentRowCollection.find({ keyFile }).sort({ row: 1 }).toArray((err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }

  static getFilesByUser (user) {
    return new Promise((resolve, reject) => {
      Mongo.preoderAssignmentFileCollection.find({ user }).sort({ onUpload: -1 }).toArray((err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }
}

async function executeBulk (rows) {
  for (let index = 0; index < rows.length; index++) {
    const doc = rows[index]
    await signup(doc).then(message => message)
      .then(() => {
        return createBeneficiary(doc)
      }).then(beneficiary => {
        return zdUserCreateOrUpdate(doc, beneficiary)
      }).then(beneficiary => {
        return createPreorder(doc, beneficiary)
      })
      .then(po => {
        return zdTicketsCreate(doc, po)
      })
      .then(message => {
        Logger.info('finish row: ' + doc.row)
      })
      .catch(reason => {
        Logger.error('preorder assignment error pull row: ' + reason.message)
        let message
        try {
          message = JSON.parse(reason.message)
          message.status = 'failed'
        } catch (error) {
          message = {status: 'failed', error: reason.message}
        }
        updateRecord(doc.id, message).catch(reason => {
          Logger.critical('Failed row: ' + doc.row)
          Logger.critical(reason.message)
        })
      })
  }
}
