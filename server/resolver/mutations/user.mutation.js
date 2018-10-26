import { UserService, PreorderService, BeneficiaryService } from '@/service'

export const userSignUp = async (parent, { user }) => {
  const emailSuggested = user.emailSuggested
  const response = await UserService.signup(user)
  console.log('response: ', response)
  if (response.message) {
    throw new Error(response.message)
  }
  if (emailSuggested && response.user.email !== emailSuggested) {
    await Promise.all([
      BeneficiaryService.updateAssigneesEmail(emailSuggested, response.user.email),
      PreorderService.updateMany(emailSuggested, response.user.email)
    ])
  }
  return response
}

export const userFbSignUp = async (parent, { user }) => {
  const emailSuggested = user.emailSuggested
  const response = await UserService.fbSignup(user)
  if (response.message) {
    throw new Error(response.message)
  }
  if (emailSuggested && response.user.email !== emailSuggested) {
    await Promise.all([
      BeneficiaryService.updateAssigneesEmail(emailSuggested, response.user.email),
      PreorderService.updateMany(emailSuggested, response.user.email)
    ])
  }
  return response
}
