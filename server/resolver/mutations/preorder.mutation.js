import { PreorderAssignmentService } from '@/service'
import { Roles, validate } from '@/util/requireRole'

export const preOrderAssignment = validate([Roles.CHAP, Roles.API])(async (parent, { file, subject, comment }, { user }) => {
  const { stream, filename, mimetype, encoding } = await file
  PreorderAssignmentService.bulk(filename, stream, subject, comment, user)
  return { stream, filename, mimetype, encoding }
})
