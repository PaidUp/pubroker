import { PreorderAssignmentService } from '@/service'
import { Roles, validate } from '@/util/requireRole'
import csvStreamToString from '@/util/csvStreamToString'

export default {
  preOrderAssignment: validate([Roles.CHAP, Roles.API])(async (parent, { file, subject, comment }, { user }) => {
    const { stream, filename, mimetype, encoding } = await file
    const csvString = await csvStreamToString(stream)
    PreorderAssignmentService.push(filename, csvString, subject, comment, user)
    return { stream, filename, mimetype, encoding }
  })
}
