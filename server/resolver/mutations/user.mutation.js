import { UserService, PreorderService, BeneficiaryService } from '@/service'

export default {
  userCreate: async (parent, { beneficiaryId, user }) => {
    const response = await UserService.signup(user)
    if (response.message) {
      throw new Error(response.message)
    }
    if (beneficiaryId) {
      await BeneficiaryService.updateAddAssigneeEmail({
        id: beneficiaryId,
        email: response.user.email
      })
    }
    return response.user
  },
  userUpdate: (parent, { id, values }) => {
    return UserService.update({ id, values })
  },
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
