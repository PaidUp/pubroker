import { Roles, validate } from '@/util/requireRole'
import { UserService } from '@/service'

export const getUsersByEmails = validate([Roles.CHAP, Roles.API])(async (_, { emails }) => {
  return UserService.getIntoEmails(emails)
})
