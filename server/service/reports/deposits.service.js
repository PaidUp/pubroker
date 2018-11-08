import config from '@/config/environment'
import trae from '@/util/trae'

export default class DepositsService {
  static fetchTransfers (account, arrival) {
    return trae(`${config.api.payment}/webhook/transfer/${encodeURI(account)}/${encodeURI(arrival)}`, 'GET')
  }

  static fetchPayments (account) {
    return trae(`${config.api.payment}/webhook/payment/${encodeURI(account)}`, 'GET')
  }
}
