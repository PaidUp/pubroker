export const Roles = {
  ALL: 'all',
  PARENT: 'parent',
  COACH: 'coach',
  CHAP: 'chap',
  API: 'api'
}

// const rolesArr = [Roles.all, Roles.parent, Roles.coach, Roles.chap, Roles.api]

export const validate = rolesArr => resolver => async (_, args, context, ...rest) => {
  if (!context.user.roles.some(r => rolesArr.includes(r))) {
    throw new Error('Not enougth permissions to access this')
  }
  const result = await resolver(...[_, args, context, ...rest])
  return result
}
