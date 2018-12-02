import config from '@/config/environment'
import trae from '@/util/trae'

export default class PaymentService {
  static verifySource (customerId, sourceId, amounts) {
    const body = { customerId, sourceId, amounts }
    return trae(`${config.api.payment}/customer/bank/verify`, 'POST', body)
  }
}
