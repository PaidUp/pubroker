import config from '@/config/environment'
import trae from '@/util/trae'

export default class SearchService {
  static async exec (criteria) {
    const result = await Promise.all([
      trae(`${config.api.user}/search?criteria=${encodeURI(criteria)}`, 'GET'),
      trae(`${config.api.organization}/beneficiary/search?criteria=${encodeURI(criteria)}`, 'GET'),
      trae(`${config.api.commerce}/search?criteria=${encodeURI(criteria)}`, 'GET')
    ]).then(results => {
      return {
        users: results[0],
        beneficiaries: results[1],
        invoices: results[2].invoices,
        credits: results[2].credits,
        preorders: results[2].preorders
      }
    })
    return result
  }
}
