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

  static async createBeneficiary ({organizationId, organizationName, firstName, lastName, assigneesEmail}) {
    return trae(`${config.api.organization}/beneficiary/create`, 'POST', {organizationId, organizationName, firstName, lastName, assigneesEmail})
  }
}
