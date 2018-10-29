// import config from '@/config/environment'
// import trae from '@/util/trae'
import { Logger, Email } from 'pu-common'
// import stream from 'stream'
import csv from 'fast-csv'
import { Parser as Json2csvParser } from 'json2csv'
import { UserService, OrganizationService, PreorderService } from '@/service'
import config from '@/config/environment'
import ZendeskService from '@/util/zendesk'
const email = new Email(config.email.options)

function replaceText (values, text) {
  Object.keys(values).forEach(key => {
    text = text.replace(new RegExp('{{' + key + '}}', 'g'), values[key])
  })
  return text
}

export default class PreorderAssignmentService {
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
          Logger.info('Row: ' + JSON.stringify(row))
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
