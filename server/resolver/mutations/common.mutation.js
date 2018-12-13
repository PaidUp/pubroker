import { request } from '@/util/trae'
// import { Roles, validate } from '@/util/requireRole'

export default {
  validateUrl: (parent, { url }) => {
    return request(url, 'HEAD').then(val => {
      console.log('val: ', val)
      return url
    }).catch(reason => {
      console.log('reason: ', reason)
      return null
    })
  }
}
