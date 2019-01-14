import config from '@/config/environment'
import trae from '@/util/trae'

export default class OrganizationService {
  static async organizations () {
    let orgs = await trae(`${config.api.organization}`, 'GET')
    let products = await trae(`${config.api.organization}/product/all`, 'GET')
    const mapOrganizations = orgs.reduce((curr, organization) => {
      organization.seasons = organization.seasons.reduce((sObj, season) => {
        season.products = {}
        products.forEach(product => {
          if (product.organizationId === organization._id && product.season === season._id) {
            season.products[product.name] = product
          }
        })
        sObj[season.name] = season
        return sObj
      }, {})
      curr[organization.businessName] = organization
      return curr
    }, {})
    return mapOrganizations
  }

  static async mapNameOrganizations () {
    let orgs = await trae(`${config.api.organization}`, 'GET')
    return orgs.reduce((curr, organization) => {
      curr[organization.businessName] = organization
      return curr
    }, {})
  }

  static async mapProducts () {
    let products = await trae(`${config.api.organization}/product/all`, 'GET')
    return products.reduce((curr, product) => {
      curr[product._id] = product
      return curr
    }, {})
  }

  static async mapPlans () {
    let plans = await trae(`${config.api.organization}/plan/all`, 'GET')
    let map = plans.reduce((curr, plan) => {
      curr[plan._id] = plan
      return curr
    }, {})
    return map
  }

  static async createBeneficiary ({organizationId, organizationName, firstName, lastName, assigneesEmail, programs}) {
    return trae(`${config.api.organization}/beneficiary/create`, 'POST', {organizationId, organizationName, firstName, lastName, assigneesEmail, programs})
  }

  static getBeneficiaries (organizationId) {
    return trae(`${config.api.organization}/${organizationId}/beneficiaries`, 'GET')
  }

  static getReducePlans (productId) {
    return trae(`${config.api.organization}/product/${productId}/plans`, 'GET').then(values => {
      return values.reduce((val, curr) => {
        let amount = 0
        if (curr.dues) { curr.dues.forEach(due => { amount = amount + due.amount }) }
        if (curr.credits) { curr.dues.forEach(crd => { amount = amount + crd.amount }) }
        let startCharge = curr.dues ? curr.dues[0].dateCharge : ''
        let endCharge = curr.dues ? curr.dues[curr.dues.length - 1].dateCharge : ''
        val.push({
          id: curr._id,
          description: curr.description,
          amount,
          installments: curr.dues.length,
          startCharge,
          endCharge
        })
        return val
      }, [])
    })
  }
}
