import { request } from '@/util/trae'
// import { Roles, validate } from '@/util/requireRole'

export default {
  validateUrl: async (parent, { url }) => {
    await request(url, 'HEAD')
    return url
  }
}
