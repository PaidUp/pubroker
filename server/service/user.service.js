import config from '@/config/environment'
import trae from '@/util/trae'
import randomstring from 'randomstring'

export default class UserService {
  static signup ({ firstName, lastName, email, emailSuggested, phone, type = 'customer', password = randomstring.generate(12) }) {
    return trae(`${config.api.user}`, 'POST', { type, password, firstName, lastName, email, emailSuggested, phone })
      .then(userResponse => userResponse)
      .catch(errors => errors)
  }

  static fbSignup ({ accessToken, phone, emailSuggested, rememberMe = false }) {
    return trae(`${config.api.user}/signup/fb`, 'POST', { accessToken, phone, rememberMe, emailSuggested })
      .then(userResponse => userResponse)
      .catch(errors => errors)
  }

  static getIntoEmails (emails) {
    return trae(`${config.api.user}/emails`, 'POST', { emails })
      .then(users => users)
      .catch(errors => errors)
  }
}
