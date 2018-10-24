import config from '@/config/environment'
import trae from '@/util/trae'

export default class BeneficiaryService {
  static updateAssigneesEmail (oldEmail, newEmail) {
    const body = { oldEmail, newEmail }
    return trae(`${config.api.organization}/beneficiary/email`, 'PUT', body)
  }
}
