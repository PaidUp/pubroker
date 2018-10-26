import { Logger, Email } from 'pu-common'
import moment from 'moment'
import csv from 'fast-csv'
import { Parser as Json2csvParser } from 'json2csv'
import { UserService, OrganizationService, CommerceService } from '@/service'
import config from '@/config/environment'

const email = new Email(config.email.options)

export default class PreorderAssignmentService {
  static async bulk (fileName, stream, user) {
    let mapOrganizations = await OrganizationService.organizations()
    const chapUserEmail = user.email
    let result = []
    try {
      csv
        .fromStream(stream, {headers: true})
        .transform((row, next) => {
          const tags = row.tags ? row.tags.split('|') : []
          const dateCharge = row.date ? moment.utc(row.date, 'MM-DD-YYYY').add(12, 'hours') : new Date()
          const {
            beneficiaryFirstName,
            beneficiaryLastName,
            parentEmail,
            parentFirstName,
            parentLastName,
            parentPhoneNumber,
            organization,
            season,
            productName,
            label,
            description,
            amount,
            status
          } = row
          Logger.info('Row: ' + JSON.stringify(row))
          UserService.signup({firstName: parentFirstName, lastName: parentLastName, email: parentEmail, phone: parentPhoneNumber}).then(user => {
            if (user.errors) {
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

              const seasonObj = organizationObj.seasons[season]
              if (!seasonObj) {
                row.creditResult = 'Invalid season.'
                return next(null, row)
              }
              const productObj = seasonObj.products[productName]
              if (!productObj) {
                row.creditResult = 'Invalid product.'
                return next(null, row)
              }
              const statues = ['paid', 'credited', 'refunded', 'discount']
              if (!statues.includes(status)) {
                row.creditResult = 'Invalid status.'
                return next(null, row)
              }
              CommerceService.addCreditMemo({
                label,
                description,
                price: amount,
                beneficiaryId: beneficiaryResult.beneficiary._id,
                assigneeEmail: parentEmail,
                productId: productObj._id,
                productName: productObj.name,
                organizationId: organizationObj._id,
                season: seasonObj._id,
                status,
                dateCharge,
                tags}).then(credit => {
                row.creditResult = 'Credit added.'
                return next(null, row)
              }).catch(reason => {
                row.creditResult = reason
                return next(null, row)
              })
            }).catch(reason => {
              Logger.info(reason)
              row.beneficiaryResult = reason
              return next(null, row)
            })
          }).catch(reason => {
            row.parentResult = reason
            return next(null, row)
          })
        })
        .on('data', (data) => {
          result.push(data)
        })
        .on('end', () => {
          const fields = ['beneficiaryFirstName',
            'beneficiaryLastName',
            'parentEmail',
            'parentFirstName',
            'parentLastName',
            'parentPhoneNumber',
            'organization',
            'season',
            'productName',
            'label',
            'description',
            'amount',
            'status',
            'parentResult',
            'beneficiaryResult',
            'creditResult']
          const json2csvParser = new Json2csvParser({ fields })
          const csv = json2csvParser.parse(result)
          const attachment = {
            content: Buffer.from(csv).toString('base64'),
            fileName: 'Result - ' + fileName,
            type: 'application/octet-stream'
          }
          email.sendEmail(chapUserEmail, 'Credit Result', 'Hi,<br> The credit bulk result was attached', [attachment])
        })
    } catch (error) {
      Logger.critical(error)
    }
  }
}
