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

function reduceInvoices (invoices) {
  let mapped = invoices.map(invoice => {
    let resp = {
      invoiceId: invoice.invoiceId,
      type: 'invoice',
      invoiceDate: invoice.dateCharge,
      description: invoice.label,
      program: invoice.productName,
      status: invoice.status,
      parentName: invoice.user.userFirstName + ' ' + invoice.user.userLastName,
      parentEmail: invoice.user.userEmail,
      amount: invoice.price,
      refund: 0,
      processingFee: invoice.stripeFee,
      paidupFee: invoice.paidupFee,
      totalFee: invoice.totalFee
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
  console.log('resp: ', mapped)
  return mapped
}

export default class CommerceService {
  static invoices (organizationId, seasonId) {
    return trae(`http://localhost:9003/api/v1/commerce/invoice/organization/${organizationId}?seasonId=${seasonId}`, 'GET')
  }

  static payments (organizationId, seasonId) {
    return Promise.all([
      trae(`http://localhost:9003/api/v1/commerce/invoice/organization/${organizationId}?seasonId=${seasonId}`, 'GET') // ,
      // trae(`http://localhost:9003/api/v1/commerce/credit/organization/${organizationId}?seasonId=${seasonId}`, 'GET'),
      // trae(`http://localhost:9003/api/v1/commerce/preorder/organization/${organizationId}?seasonId=${seasonId}`, 'GET')
    ]).then(values => {
      return reduceInvoices(values[0])
    })
  }
}
