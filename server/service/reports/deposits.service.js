import config from '@/config/environment'
import trae from '@/util/trae'

export default class DepositsService {
  static async fetchTransfers (account, arrival, source) {
    const transfers = await trae(`${config.api.payment}/webhook/transfer/${encodeURI(account)}/${encodeURI(arrival)}/${encodeURI(source)}`, 'GET')
    const invoiceIds = transfers.reduce((curr, tr) => {
      curr.push(tr.source_transaction.metadata.invoiceId)
      return curr
    }, [])
    const invoices = await trae(`${config.api.commerce}/invoice/invoiceIds/`, 'POST', { invoiceIds })
    transfers.forEach(tr => {
      invoices.forEach(inv => {
        if (tr.source_transaction.metadata.invoiceId === inv.invoiceId) {
          tr.invoice = inv
        }
      })
    })
    return transfers
  }

  static fetchPayouts (account) {
    return trae(`${config.api.payment}/webhook/payout/${encodeURI(account)}`, 'GET')
  }
}
