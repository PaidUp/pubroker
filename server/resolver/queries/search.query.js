import { Roles, validate } from '@/util/requireRole'
import { SearchService } from '@/service'

export const search = validate([Roles.CHAP, Roles.API])(async (_, args) => {
  return SearchService.exec(args.criteria)
})
