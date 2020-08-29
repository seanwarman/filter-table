import api from '../../libs/apiMethods'
import Queries from './Queries'
import { basePath } from '../../libs/BigglyAPIEndpoints.js'

export default class Actions {
  constructor(apiKey, userKey) {
    this.userKey = userKey
    this.api = api(apiKey)
    this.queries = new Queries()
  }

  updateContentCapacity(key, data) {
    return this.api.updatePublic(this.queries.updateContentCapacity(key), data)
  }

  createContentCapacity(data) {
    return this.api.createPublic(this.queries.createContentCapacity(), data)
  }

  getContentCapacity(from, to) {
    return this.api.listPublic(this.queries.getContentCapacity(from, to))
  }

  getDailyUnitCount(from, to) {
    return this.api.listPublic(this.queries.getDailyUnitCount(from, to))
  }

  getExcessUnitsByStatus(from, to) {
    return this.api.listPublic(this.queries.getExcessUnitsByStatus(from, to))
  }

  getExcessUnits(from, to) {
    return this.api.getPublic(this.queries.getExcessUnits(from, to))
  }

  getPersonalTotalUnits(startDate, endDate) {
    return this.api.listPublic(this.queries.getPersonalTotalUnits(startDate, endDate))
  }

  getPersonalBreakdownUnits(startDate, endDate) {
    return this.api.listPublic(this.queries.getPersonalBreakdownUnits(startDate, endDate))
  }

  getCustomers() {
    return this.api.listPublic(this.queries.getCustomers())
  }

  getCustomerSites() {
    return this.api.listPublic(this.queries.getCustomerSites())
  }

  getCustomerSitesByCustomerKey(customerKey) {
    return this.api.listPublic(this.queries.getCustomerSitesByCustomerKey(customerKey))
  }

  async createBenchmarkForSite(customerSiteKey, {
    puppeteerTargets,
    cheerioTargets
  }) {

    return this.api.custom('post', apiKey => {

      const stage = window.location.href.includes('dev.biggly' || 'bms2') ?
        'reports'
        :
        'localdev'

      return [ 
        `${basePath(stage)}/reports/key/${apiKey}/site/${customerSiteKey}/benchmark`, {
          puppeteerTargets,
          cheerioTargets
        }
      ]

    })
  }

  getBenchmark(benchmarksKey) {
    return this.api.getPublic(this.queries.getBenchmark(benchmarksKey))
  }
}
