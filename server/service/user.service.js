import config from '@/config/environment'
import trae from '@/util/trae'
import randomstring from 'randomstring'
import ZendeskService from '@/util/zendesk'
import { Logger } from 'pu-common'

export default class UserService {
  static signup ({ firstName, lastName, email, emailSuggested, phone, type = 'customer', password = randomstring.generate(12), pendingSignup = false }) {
    return trae(`${config.api.user}`, 'POST', { type, password, firstName, lastName, email, emailSuggested, phone, pendingSignup })
      .then(userResponse => {
        ZendeskService.userCreateOrUpdate({
          email,
          name: firstName + ' ' + lastName,
          phone
        }).then(res => {
          Logger.info(`User ${email} crated in ZD`)
        }).catch(reason => {
          Logger.error(reason.message)
        })
        return userResponse
      })
      .catch(errors => errors)
  }

  static fbSignup ({ accessToken, phone, emailSuggested, rememberMe = false }) {
    return trae(`${config.api.user}/signup/fb`, 'POST', { accessToken, phone, rememberMe, emailSuggested })
      .then(userResponse => {
        const {email, firstName, lastName, phone} = userResponse.user
        const params = {
          email,
          name: firstName + ' ' + lastName,
          phone
        }
        ZendeskService.userCreateOrUpdate(params).then(res => {
          Logger.info(`FBUser ${email} crated in ZD`)
        }).catch(reason => {
          Logger.error(reason.message)
        })
        return userResponse
      })
      .catch(errors => errors)
  }

  static getIntoEmails (emails) {
    return trae(`${config.api.user}/emails`, 'POST', { emails })
      .then(users => users)
      .catch(errors => errors)
  }

  static update ({id, values}) {
    return trae(`${config.api.user}`, 'PUT', {id, values})
  }
}
