import config from '@/config/environment'
import trae from '@/util/trae'
import ZendeskService from '@/util/zendesk'
import { Logger } from 'pu-common'

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

  static save ({ organizationId, organizationName, firstName, lastName, assigneesEmail, description, programs, multipleBeneficiaries }) {
    return new Promise((resolve, reject) => {
      trae(baseUrl, 'POST', { organizationId, organizationName, firstName, lastName, assigneesEmail, description, programs })
        .then(response => resolve(response)).catch(reason => reject(reason))
      ZendeskService.userCreateOrUpdate({
        email: assigneesEmail[0],
        beneficiary: firstName + ' ' + lastName,
        organization: { name: organizationName },
        multipleBeneficiaries
      }).then(res => {
        Logger.info(`User ${assigneesEmail} updated in ZD`)
      }).catch(reason => {
        Logger.error(reason.message)
      })
    })
  }

  static update (id, values) {
    return trae(`${baseUrl}/${id}`, 'PUT', values)
  }

  static delete (id) {
    return trae(`${baseUrl}/${id}`, 'DELETE')
  }
}
