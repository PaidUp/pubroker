import { ImportCreditsService } from '@/service'
import { Roles, validate } from '@/util/requireRole'

export const importCredits = validate([Roles.CHAP, Roles.API])(async (parent, { file }, { user }) => {
  const { stream, filename, mimetype, encoding } = await file
  ImportCreditsService.bulk(filename, stream, user)
  return { stream, filename, mimetype, encoding }
})
