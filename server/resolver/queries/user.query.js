import { Roles, validate } from '@/util/requireRole'
import { UserService } from '@/service'

export default {
  getUsersByEmails: validate([Roles.CHAP, Roles.API])(async (_, { emails }) => {
    const result = await UserService.getIntoEmails(emails)
    return result
  })
}
