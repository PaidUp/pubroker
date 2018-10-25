import config from '@/config/environment'
import trae from '@/util/trae'

export default class PreorderService {
  static updateMany (emailSuggested, email) {
    const body = {
      conditions: { assigneeEmail: emailSuggested },
      values: { assigneeEmail: email }
    }
    return trae(`${config.api.commerce}/preorder/many`, 'PUT', body)
  }

  static create (body) {
    return trae(`${config.api.commerce}/preorder`, 'POST', body)
  }
}
