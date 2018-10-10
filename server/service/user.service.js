import config from '@/config/environment'
import trae from '@/util/trae'
import randomstring from 'randomstring'

export default class UserService {
  static signup ({firstName, lastName, email, phone}) {
    return trae(`${config.api.user}`, 'POST', {
      type: 'customer',
      password: randomstring.generate(12),
      firstName,
      lastName,
      email,
      phone
    })
  }
}
