import fetch from 'node-fetch'

function trae (url, method, body) {
  const options = {
    method,
    body,
    headers: { 'x-api-key': 'JF06f7FJjTDkNOcM1sdywWw5CZBHW4Jy' }
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

function reduceInvoices (invoices, beneficiaries) {
  let mapped = invoices.map(invoice => {
    let beneficiary = beneficiaries[invoice.beneficiaryId]
    let resp = {
      receiptId: invoice.invoiceId,
      type: 'invoice',
      receiptDate: invoice.dateCharge,
      description: invoice.label,
      program: invoice.productName,
      status: invoice.status,
      parentName: invoice.user.userFirstName + ' ' + invoice.user.userLastName,
      parentEmail: invoice.user.userEmail,
      playerName: beneficiary.firstName + ' ' + beneficiary.lastName,
      amount: invoice.price,
      refund: 0,
      processingFee: invoice.stripeFee,
      paidupFee: invoice.paidupFee,
      totalFee: invoice.totalFee,
      tags: invoice.tags
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

function reduceCredits (credits, beneficiaries) {
  let mapped = credits.map(credit => {
    let beneficiary = beneficiaries[credit.beneficiaryId]
    let resp = {
      receiptId: credit.memoId,
      type: 'credit',
      receiptDate: credit.createOn,
      description: credit.label,
      program: credit.productName,
      status: credit.status,
      parentName: '',
      parentEmail: credit.assigneeEmail,
      playerName: beneficiary.firstName + ' ' + beneficiary.lastName,
      amount: credit.price,
      tags: credit.tags
      // refund: 0,
      // processingFee: 0,
      // paidupFee: 0,
      // totalFee: 0
    }
    return resp
  })
  return mapped
}

function reducePreorders (preorders, beneficiaries) {
  const today = new Date().getTime()
  let mapped = []
  preorders.forEach(preorder => {
    let beneficiary = beneficiaries[preorder.beneficiaryId]
    preorder.dues.forEach(due => {
      let resp = {
        receiptId: '',
        type: 'preorder',
        receiptDate: due.dateCharge,
        description: due.description,
        program: preorder.productName,
        status: '',
        parentName: '',
        parentEmail: preorder.assigneeEmail,
        playerName: beneficiary.firstName + ' ' + beneficiary.lastName,
        amount: due.amount,
        tags: due.tags
        // refund: 0,
        // processingFee: 0,
        // paidupFee: 0,
        // totalFee: 0
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
    return trae(`http://localhost:9003/api/v1/commerce/invoice/organization/${organizationId}?seasonId=${seasonId}`, 'GET')
  }

  static payments (organizationId, seasonId) {
    return Promise.all([
      trae(`http://localhost:9002/api/v1/organization/${organizationId}/beneficiaries`, 'GET'),
      trae(`http://localhost:9003/api/v1/commerce/invoice/organization/${organizationId}?seasonId=${seasonId}`, 'GET'),
      trae(`http://localhost:9003/api/v1/commerce/credit/organization/${organizationId}?seasonId=${seasonId}`, 'GET'),
      trae(`http://localhost:9003/api/v1/commerce/preorder/organization/${organizationId}?seasonId=${seasonId}`, 'GET')
    ]).then(values => {
      const beneficiaries = mapBeneficiaries(values[0])
      const invoices = reduceInvoices(values[1], beneficiaries)
      const credits = reduceCredits(values[2], beneficiaries)
      const preorders = reducePreorders(values[3], beneficiaries)
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
