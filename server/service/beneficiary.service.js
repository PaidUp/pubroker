import config from '@/config/environment'
import trae from '@/util/trae'

const baseUrl = config.api.organization + '/beneficiary'

export default class BeneficiaryService {
  static updateAssigneesEmail (oldEmail, newEmail) {
    const body = { oldEmail, newEmail }
    return trae(`${baseUrl}/email`, 'PUT', body)
  }

  static updateAddAssigneeEmail ({id, email}) {
    const body = { id, email }
    return trae(`${baseUrl}/email/add`, 'PUT', body)
  }

  static create ({ organizationId, organizationName, firstName, lastName, assigneesEmail, description }) {
    return trae(baseUrl, 'POST', { organizationId, organizationName, firstName, lastName, assigneesEmail, description })
  }

  static update (id, values) {
    return trae(`${baseUrl}/${id}`, 'PUT', values)
  }

  static delete (id) {
    return trae(`${baseUrl}/${id}`, 'DELETE')
  }
}
