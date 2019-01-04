import config from '@/config/environment'
import trae from '@/util/trae'
import moment from 'moment-timezone'
import OrganizationService from './organization.service'
import ReduceDataCardService from './commerce/reduce-data-card-service'

function mapBeneficiaries (beneficiaries) {
  if (!beneficiaries) return {}
  return beneficiaries.reduce((redu, curr) => {
    redu[curr._id] = curr
    return redu
  }, {})
}

function mapUsers (users) {
  if (!users) return {}
  return users.reduce((redu, curr) => {
    redu[curr.email] = curr
    return redu
  }, {})
}

function reduceInvoices (invoices, beneficiaries, users) {
  let mapped = invoices.map(invoice => {
    let beneficiary = beneficiaries[invoice.beneficiaryId]
    let user = users[invoice.user.userEmail]
    let resp = {
      receiptId: invoice.invoiceId,
      type: 'invoice',
      receiptDate: invoice.dateCharge,
      description: invoice.label,
      program: invoice.productName,
      status: invoice.status,
      parentName: user ? user.firstName + ' ' + user.lastName : '',
      parentPhone: user ? user.phone : '',
      parentEmail: invoice.user.userEmail,
      playerName: beneficiary ? beneficiary.firstName + ' ' + beneficiary.lastName : '',
      amount: invoice.price,
      refund: 0,
      processingFee: getProcessingFees(invoice),
      paidupFee: invoice.paidupFee,
      totalFee: getTotalFees(invoice),
      tags: invoice.tags,
      paymentMethodBrand: invoice.paymentDetails.brand,
      paymentMethodLast4: invoice.paymentDetails.last4,
      index: `${invoice.invoiceId} ${invoice.label} ${user ? user.firstName : ''} ${user ? user.lastName : ''} ${invoice.user.userEmail} ${beneficiary ? beneficiary.firstName : ''} ${beneficiary ? beneficiary.lastName : ''}`
    }
    invoice.attempts.forEach(attempt => {
      if (attempt.object === 'charge') {
        if (typeof attempt.created === 'number') {
          resp['chargeDate'] = moment(attempt.created * 1000).toISOString()
        } else {
          resp['chargeDate'] = attempt.created
        }
      }
      if (attempt.object === 'refund') {
        resp.refund = (attempt.amount / 100) + resp.refund
      }
    })
    return resp
  })
  return mapped
}

function reduceCredits (credits, beneficiaries, users) {
  let mapped = credits.map(credit => {
    let beneficiary = beneficiaries[credit.beneficiaryId]
    let user = users[credit.assigneeEmail]
    let resp = {
      receiptId: credit.memoId,
      type: 'credit',
      receiptDate: credit.createOn,
      description: credit.label,
      program: credit.productName,
      status: credit.status,
      parentName: user ? user.firstName + ' ' + user.lastName : '',
      parentPhone: user ? user.phone : '',
      parentEmail: credit.assigneeEmail,
      playerName: beneficiary ? beneficiary.firstName + ' ' + beneficiary.lastName : '',
      amount: credit.price,
      tags: credit.tags,
      paymentMethodBrand: '',
      paymentMethodLast4: '',
      index: `${credit.memoId} ${credit.label} ${user ? user.firstName : ''} ${user ? user.lastName : ''} ${credit.assigneeEmail} ${beneficiary ? beneficiary.firstName : ''} ${beneficiary ? beneficiary.lastName : ''}`
    }
    return resp
  })
  return mapped
}

function getProcessingFees (invoice) {
  if (invoice.unbundle && invoice.paymentDetails.paymentMethodtype === 'bank_account') return 0
  return invoice.stripeFee
}

function getTotalFees (invoice) {
  if (invoice.unbundle && invoice.paymentDetails.paymentMethodtype === 'bank_account') return invoice.paidupFee
  return invoice.totalFee
}

function reducePreorders (preorders, beneficiaries, users) {
  const today = new Date().getTime()
  let mapped = []
  preorders.forEach(preorder => {
    let beneficiary = beneficiaries[preorder.beneficiaryId]
    let user = users[preorder.assigneeEmail]
    preorder.dues.forEach(due => {
      let resp = {
        receiptId: '',
        type: 'preorder',
        receiptDate: due.dateCharge,
        description: due.description,
        program: preorder.productName,
        status: '',
        parentName: user ? user.firstName + ' ' + user.lastName : '',
        parentPhone: user ? user.phone : '',
        parentEmail: preorder.assigneeEmail,
        playerName: beneficiary ? beneficiary.firstName + ' ' + beneficiary.lastName : '',
        amount: due.amount,
        tags: due.tags,
        paymentMethodBrand: '',
        paymentMethodLast4: '',
        index: `${due.description} ${user ? user.firstName : ''} ${user ? user.lastName : ''} ${preorder.assigneeEmail} ${beneficiary ? beneficiary.firstName : ''} ${beneficiary ? beneficiary.lastName : ''}`
      }
      let dateCharge = new Date(due.dateCharge).getTime()
      if (today < dateCharge) {
        resp.status = 'due'
      } else {
        resp.status = 'overdue'
      }

      mapped.push(resp)
    })
  })
  return mapped
}

function invoicesByOrganization (organizationId, seasonId, productId, beneficiaryId) {
  let params = `seasonId=${seasonId}`
  if (productId) params = `${params}&productId=${productId}`
  if (beneficiaryId) params = `${params}&beneficiaryId=${beneficiaryId}`
  return trae(`${config.api.commerce}/invoice/organization/${organizationId}?${params}`, 'GET')
}

function creditsByOrganization (organizationId, seasonId, productId, beneficiaryId) {
  let params = `seasonId=${seasonId}`
  if (productId) params = `${params}&productId=${productId}`
  if (beneficiaryId) params = `${params}&beneficiaryId=${beneficiaryId}`
  return trae(`${config.api.commerce}/credit/organization/${organizationId}?${params}`, 'GET')
}

function preordersByOrganization (organizationId, seasonId, productId, beneficiaryId) {
  let params = `seasonId=${seasonId}`
  if (productId) params = `${params}&productId=${productId}`
  if (beneficiaryId) params = `${params}&beneficiaryId=${beneficiaryId}`
  return trae(`${config.api.commerce}/preorder/organization/${organizationId}?${params}`, 'GET')
}

export default class CommerceService {
  static invoices (organizationId, seasonId) {
    return trae(`${config.api.commerce}/invoice/organization/${organizationId}?seasonId=${seasonId}`, 'GET')
  }

  static payments (organizationId, seasonId) {
    return Promise.all([
      trae(`${config.api.user}/all`, 'GET'),
      trae(`${config.api.organization}/${organizationId}/beneficiaries`, 'GET'),
      trae(`${config.api.commerce}/invoice/organization/${organizationId}?seasonId=${seasonId}`, 'GET'),
      trae(`${config.api.commerce}/credit/organization/${organizationId}?seasonId=${seasonId}`, 'GET'),
      trae(`${config.api.commerce}/preorder/organization/${organizationId}?seasonId=${seasonId}`, 'GET')
    ]).then(values => {
      const users = mapUsers(values[0])
      const beneficiaries = mapBeneficiaries(values[1])
      const invoices = reduceInvoices(values[2], beneficiaries, users)
      const credits = reduceCredits(values[3], beneficiaries, users)
      const preorders = reducePreorders(values[4], beneficiaries, users)
      let merged = invoices.concat(credits).concat(preorders)
      merged.sort((receiptA, receiptB) => {
        const dateA = new Date(receiptA.receiptDate)
        const dateB = new Date(receiptB.receiptDate)
        return dateA.getTime() - dateB.getTime()
      })
      return merged
    })
  }

  static addCreditMemo ({ label, description, price, beneficiaryId, assigneeEmail, productId, productName, organizationId, season, status, dateCharge, tags }) {
    const body = { label, description, price, beneficiaryId, assigneeEmail, productId, productName, organizationId, season, status, dateCharge, tags }
    return trae(`${config.api.commerce}/credit`, 'POST', body)
  }

  static getReducePlayers (context) {
    let organizationId = context.organizationId
    let seasonId = context.seasonId
    let productId = context.productId
    return Promise.all([
      OrganizationService.getBeneficiaries(organizationId),
      invoicesByOrganization(organizationId, seasonId, productId),
      creditsByOrganization(organizationId, seasonId, productId),
      preordersByOrganization(organizationId, seasonId, productId)
    ]).then(values => {
      let beneficiaries = values[0].reduce((val, curr) => {
        val[curr._id] = curr
        return val
      }, {})
      let items = ReduceDataCardService.reduceInvoicePlayers(values[1], beneficiaries)
      ReduceDataCardService.reduceCreditPlayers(values[2], items, beneficiaries)
      ReduceDataCardService.reducePreorderPlayers(values[3], items, beneficiaries)
      values[0].forEach(beneficiary => {
        let item = items[beneficiary._id]
        if (!item) {
          items[beneficiary._id] = {
            id: beneficiary._id,
            firstName: beneficiary.firstName,
            lastName: beneficiary.lastName,
            total: 0,
            assigneesEmail: beneficiary.assigneesEmail,
            paid: 0,
            unpaid: 0,
            overdue: 0,
            other: 0
          }
        }
      })
      return ReduceDataCardService.sortObj(items, 'id', item => {
        return item.lastName + ' ' + item.firstName
      })
    })
  }
}
