import { request } from '@/util/trae'

export default {
  validateUrl: async (parent, { url }) => {
    try {
      await request(url, 'HEAD')
      return url
    } catch (error) {
      return null
    }
  }
}
