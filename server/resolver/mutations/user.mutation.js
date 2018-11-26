import { UserService, PreorderService, BeneficiaryService } from '@/service'

export default {
  userSignUp: async (parent, { user }) => {
    const emailSuggested = user.emailSuggested
    const response = await UserService.signup(user)
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
  },
  userFbSignUp: async (parent, { user }) => {
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
}
