import config from '@/config/environment'
import trae from '@/util/trae'

function calculateStripeCreditFee (amount, invoice) {
  return (((amount / 100) * (invoice.processingFees.cardFee / 100)) + invoice.processingFees.cardFeeFlat)
}

export default class DepositsService {
  static async fetchBalanceHistory (account, payout) {
    const balance = await trae(`${config.api.payment}/deposit/balance/${encodeURI(account)}/${encodeURI(payout)}`, 'GET')
    const invoiceIds = balance.reduce((curr, trx) => {
      if (trx.type === 'payment' || trx.type === 'adjustment') {
        curr.push(trx.source.source_transfer.source_transaction.metadata.invoiceId)
      }
      return curr
    }, [])
    const invoices = await trae(`${config.api.commerce}/invoice/invoiceIds/`, 'POST', { invoiceIds })
    const invoicesMap = invoices.reduce((curr, inv) => {
      curr[inv.invoiceId] = inv
      return curr
    }, {})
    const paymentRefundMap = balance.reduce((curr, trx) => {
      console.log('curr: ', curr)
      if (trx.type === 'payment_refund') {
        if (!curr[trx.source.charge]) curr[trx.source.charge] = 0
        curr[trx.source.charge] = curr[trx.source.charge] + trx.amount
      }
      return curr
    }, {})
    console.log('paymentRefundMap: ', paymentRefundMap)
    return balance.reduce((curr, trx) => {
      if (trx.type === 'payment' || trx.type === 'adjustment') {
        let {processingFee, paidupFee, netDeposit, processed, adjustment} = 0
        let invoiceDate = null
        let program = ''
        let tags = []
        let totalFee
        const invoice = invoicesMap[trx.source.source_transfer.source_transaction.metadata.invoiceId]
        if (invoice) {
          invoiceDate = invoice.dateCharge
          program = invoice.productName
          tags = invoice.tags
          if (trx.type === 'payment') {
            processed = trx.source.amount / 100
            netDeposit = trx.net / 100
            if (invoice.paymentDetails.paymentMethodtype === 'card') {
              totalFee = trx.fee / 100
              processingFee = calculateStripeCreditFee(trx.source.amount, invoice)
              paidupFee = totalFee - processingFee
            }
            if (invoice.paymentDetails.paymentMethodtype === 'bank_account') {
              totalFee = trx.fee / 100
              processingFee = 0
              paidupFee = totalFee
            }
          }
          if (trx.type === 'adjustment') {
            adjustment = trx.amount / 100
            processed = (trx.source.amount - trx.source.amount_refunded) / 100
            console.log('trx.source.id: ', trx.source.id)
            netDeposit = paymentRefundMap[trx.source.id] / 100
            totalFee = 0
            processingFee = 0
            paidupFee = 0
            // if (processed > 0) {
            //   if (tr.invoice.paymentDetails.paymentMethodtype === 'card') {
            //     totalFee = currency(tr.amount / 100)
            //     processingFee = currency(calculateStripeCreditFee(tr.source.amount_refunded, tr.invoice)) * -1
            //     paidupFee = currency(totalFee - processingFee)
            //   }
            //   if (tr.invoice.paymentDetails.paymentMethodtype === 'bank_account') {
            //     totalFee = currency(tr.amount / 100) * -1
            //     processingFee = currency(0)
            //     paidupFee = totalFee
            //   }
            // }
          }
        }
        curr.push({
          invoiceId: trx.source.source_transfer.source_transaction.metadata.invoiceId,
          invoiceDate,
          chargeDate: new Date(trx.source.source_transfer.source_transaction.created * 1000),
          processed,
          processingFee,
          paidupFee,
          totalFee,
          netDeposit,
          adjustment,
          description: trx.source.source_transfer.source_transaction.description,
          program,
          parentName: trx.source.source_transfer.source_transaction.metadata.userFirstName + ' ' + trx.source.source_transfer.source_transaction.metadata.userLastName,
          playerName: trx.source.source_transfer.source_transaction.metadata.beneficiaryFirstName + ' ' + trx.source.source_transfer.source_transaction.metadata.beneficiaryLastName,
          tags,
          index: trx.source.source_transfer.source_transaction.metadata.invoiceId + ' ' +
            trx.source.source_transfer.source_transaction.description + ' ' +
            (trx.invoice ? trx.invoice.productName : '') + ' ' +
            trx.source.source_transfer.source_transaction.metadata.userFirstName + ' ' +
            trx.source.source_transfer.source_transaction.metadata.userLastName + ' ' +
            trx.source.source_transfer.source_transaction.metadata.beneficiaryFirstName + ' ' +
            trx.source.source_transfer.source_transaction.metadata.beneficiaryLastName
        })
      }
      return curr
    }, [])
  }

  static fetchPayouts ({account, limit = 10, startingAfter, endingBefore} = {}) {
    let url = `${config.api.payment}/deposit/payout/${encodeURI(account)}?limit=${limit}`
    if (startingAfter) url = `${url}&startingAfter=${encodeURI(startingAfter)}`
    if (endingBefore) url = `${url}&endingBefore=${encodeURI(endingBefore)}`
    return trae(url, 'GET')
  }
}
