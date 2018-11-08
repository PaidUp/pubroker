import config from '@/config/environment'
import trae from '@/util/trae'

export default class DepositsService {
  static fetchTransfers (account, arrival, source) {
    return trae(`${config.api.payment}/webhook/transfer/${encodeURI(account)}/${encodeURI(arrival)}/${encodeURI(source)}`, 'GET')
  }

  static fetchPayouts (account) {
    return trae(`${config.api.payment}/webhook/payout/${encodeURI(account)}`, 'GET')
  }
}
