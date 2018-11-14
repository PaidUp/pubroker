import config from '@/config/environment'
import zendesk from 'node-zendesk'

const client = zendesk.createClient({
  username: config.zendesk.username,
  token: config.zendesk.token,
  remoteUri: `https://${config.zendesk.subdomain}.zendesk.com/api/v2`
})
const cfTicketReasonCategoryId = config.zendesk.customFields.ticketReasonCategory
const cfBalanceId = config.zendesk.customFields.balance
const cfPreoderId = config.zendesk.customFields.preorderId
const cfPaymentLinkId = config.zendesk.customFields.paymentLink

export default class Zendesk {
  static userCreateOrUpdate ({email, name, phone, organization, beneficiary, product}) {
    let userFields = {
      paidup_customer: 'paidupcustomer',
      athlete_name: beneficiary,
      products: product,
      user_type: 'user_type_paidup_customer'
    }
    return new Promise((resolve, reject) => {
      client.users.createOrUpdate({
        user: {
          role: 'end-user',
          email,
          name,
          phone,
          organization,
          user_fields: userFields
        }
      }, (error, response, result) => {
        if (error) return reject(error)
        resolve(result)
      })
    })
  }

  static ticketsCreate ({preorderId, subject, comment, status, requesterEmail, requesterName, ticketAssignee, ticketPriority, cfBalance, cfPaymentLink, cfTicketReasonCategory, ticketTags, isPublic}) {
    return new Promise((resolve, reject) => {
      let customFields = [{id: cfPreoderId, value: preorderId}]
      if (cfBalance) {
        customFields.push({id: cfBalanceId, value: cfBalance})
      }
      if (cfPaymentLink) {
        customFields.push({id: cfPaymentLinkId, value: cfPaymentLink})
      }
      if (cfTicketReasonCategory) {
        customFields.push({id: cfTicketReasonCategoryId, value: cfTicketReasonCategory})
      }

      client.tickets.create({
        ticket: {
          subject,
          requester: {
            email: requesterEmail,
            name: requesterName
          },
          comment: {
            html_body: comment
          },
          status,
          priority: ticketPriority,
          assignee_email: ticketAssignee,
          tags: ticketTags,
          isPublic: (isPublic && isPublic.toLowerCase() === 'true'),
          custom_fields: customFields
        }
      }, (error, req, result) => {
        if (error) return reject(error)
        resolve(result)
      })
    })
  }

  static search (queryStr) {
    return new Promise((resolve, reject) => {
      client.search.query(queryStr, (error, req, results) => {
        if (error) return reject(error)
        resolve(results)
      })
    })
  }

  static ticketsUpdate (id, values) {
    return new Promise((resolve, reject) => {
      client.tickets.update(id, values, (error, data) => {
        if (error) return reject(error)
        resolve(data)
      })
    })
  }
}
