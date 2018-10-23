import config from '@/config/environment'
import trae from '@/util/trae'
import randomstring from 'randomstring'

export default class UserService {
  static signup ({ firstName, lastName, email, phone, type = 'customer', password = randomstring.generate(12) }) {
    return trae(`${config.api.user}`, 'POST', { type, password, firstName, lastName, email, phone })
  }

  static fbSignup ({ accessToken, phone, rememberMe = false }) {
    return trae(`${config.api.user}/signup/fb`, 'POST', { accessToken, phone, rememberMe })
  }
}
