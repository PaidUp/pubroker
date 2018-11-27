import config from '@/config/environment'
import trae from '@/util/trae'

export default class BeneficiaryService {
  static updateAssigneesEmail (oldEmail, newEmail) {
    const body = { oldEmail, newEmail }
    return trae(`${config.api.organization}/beneficiary/email`, 'PUT', body)
  }

  static updateAddAssigneeEmail ({id, email}) {
    const body = { id, email }
    return trae(`${config.api.organization}/beneficiary/email/add`, 'PUT', body)
  }
}
