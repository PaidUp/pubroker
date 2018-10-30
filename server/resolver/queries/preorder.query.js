import { Roles, validate } from '@/util/requireRole'
import { PreorderAssignmentService } from '@/service'

export const preorderAssignmentFiles = validate([Roles.CHAP, Roles.API])(async (_, { email }) => {
  return PreorderAssignmentService.getFilesByUser(email)
})

export const preorderAssignmentRows = validate([Roles.CHAP, Roles.API])(async (_, { keyFile }) => {
  return PreorderAssignmentService.getRowsByFile(keyFile)
})
