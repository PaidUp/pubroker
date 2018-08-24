import fetch from 'node-fetch'
import config from '@/config/environment'
function trae (url, method, body) {
  const options = {
    method,
    body,
    headers: { 'x-api-key': config.api.key }
  }
  return fetch(url,
    options
  ).then(res => res.json())
}

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
      playerName: beneficiary.firstName + ' ' + beneficiary.lastName,
      amount: invoice.price,
      refund: 0,
      processingFee: invoice.stripeFee,
      paidupFee: invoice.paidupFee,
      totalFee: invoice.totalFee,
      tags: invoice.tags,
      index: `${invoice.invoiceId} ${invoice.label} ${user ? user.firstName : ''} ${user ? user.lastName : ''} ${invoice.user.userEmail} ${beneficiary.firstName} ${beneficiary.lastName}`
    }
    invoice.attempts.forEach(attempt => {
      if (attempt.object === 'charge') {
        resp['chargeDate'] = attempt.created
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
      playerName: beneficiary.firstName + ' ' + beneficiary.lastName,
      amount: credit.price,
      tags: credit.tags,
      index: `${credit.memoId} ${credit.label} ${user ? user.firstName : ''} ${user ? user.lastName : ''} ${credit.assigneeEmail} ${beneficiary.firstName} ${beneficiary.lastName}`
    }
    return resp
  })
  return mapped
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
        playerName: beneficiary.firstName + ' ' + beneficiary.lastName,
        amount: due.amount,
        tags: due.tags,
        index: `${due.description} ${user ? user.firstName : ''} ${user ? user.lastName : ''} ${preorder.assigneeEmail} ${beneficiary.firstName} ${beneficiary.lastName}`
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
}
