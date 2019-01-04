import { Roles, validate } from '@/util/requireRole'
import { PreorderAssignmentService } from '@/service'

export default {
  preorderAssignmentFiles: validate([Roles.CHAP, Roles.API])(async (_, { email }) => {
    return PreorderAssignmentService.getFilesByUser(email)
  }),
  preorderAssignmentRows: validate([Roles.CHAP, Roles.API])(async (_, { keyFile }) => {
    return PreorderAssignmentService.getRowsByFile(keyFile)
  })
}
