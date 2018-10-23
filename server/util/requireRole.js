const Roles = {
  PARENT: 'parent',
  COACH: 'coach',
  CHAP: 'chap',
  API: 'api'
}

export const requiresRole = role => resolver => async (_, args, context, ...rest) => {
  console.log('context.user: ', context.user)
  if (context.user.roles.indexOf(role) < 0) {
    throw new Error('Not enougth permissions to access this')
  }
  const result = await resolver(...[_, args, context, ...rest])
  return result
}
export const parent = requiresRole(Roles.PARENT)
export const coach = requiresRole(Roles.COACH)
export const chap = requiresRole(Roles.CHAP)
export const api = requiresRole(Roles.API)
