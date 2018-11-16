import config from '@/config/environment'
import trae from '@/util/trae'

export default class DepositsService {
  static async fetchBalanceHistory (account, payout) {
    const balance = await trae(`${config.api.payment}/deposit/balance/${encodeURI(account)}/${encodeURI(payout)}`, 'GET')
    const invoiceIds = balance.reduce((curr, trx) => {
      curr.push(trx.source.source_transfer.source_transaction.metadata.invoiceId)
      return curr
    }, [])
    const invoices = await trae(`${config.api.commerce}/invoice/invoiceIds/`, 'POST', { invoiceIds })
    return balance.map(trx => {
      invoices.forEach(inv => {
        if (trx.source.source_transfer.source_transaction.metadata.invoiceId === inv.invoiceId) {
          trx.invoice = inv
        }
      })
      return trx
    })
  }

  static fetchPayouts ({account, limit = 10, startingAfter} = {}) {
    let url = `${config.api.payment}/deposit/payout/${encodeURI(account)}?limit=${limit}`
    if (startingAfter) url = `${url}&startingAfter=${encodeURI(startingAfter)}`
    return trae(url, 'GET')
  }
}
