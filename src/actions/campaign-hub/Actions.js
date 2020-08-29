import api from '../../libs/apiMethods'
import Queries from './Queries'
import SocketLibrary from '../../libs/SocketLibrary'

export default class Actions {
  constructor(apiKey, userKey) {

    this.userKey = userKey
    this.api = api(apiKey)
    this.queries = new Queries()

  }
  getCampaign(key) {
    return this.api.getPublic(this.queries.getCampaign(key))
  }
  getCampaigns() {
    return this.api.listPublic(this.queries.getCampaigns())
  }
  getCampaignDivisions() {
    return this.api.listPublic(this.queries.getCampaignDivisions())
  }
  getProducts() {
    return this.api.listPublic(this.queries.getProducts())
  }
  getProductsAndBookingTemplates() {
    return this.api.listPublic(this.queries.getProductsAndBookingTemplates())
  }
  getBookingTemplatesByDivKeySmall(key) {
    return this.api.listPublic(this.queries.getBookingTemplatesByDivKeySmall(key))
  }
  async getActivatedBookings(key) {
    let bookings = await this.api.listPublic(this.queries.getActivatedBookings(key))
    console.log('bookings : ', bookings)
    return bookings
  }
  getBookingTemplatesByDivKey(key) {
    console.log('getBookingTemplatesByDivKey')
    return this.api.listPublic(this.queries.getBookingTemplatesByDivKey(key))
  }
  getTemplatesByProductKey(where) {
    return this.api.listPublic(this.queries.getTemplatesByProductKey(where))
  }
  getPartnersNameAndKey() {
    return this.api.listPublic(this.queries.getPartnersNameAndKey())
  }
  getCustomers() {
    return this.api.listPublic(this.queries.getCustomers())
  }
  getCustomersByPartnerKey(partnerKey) {
    return this.api.listPublic(this.queries.getCustomersByPartnerKey(partnerKey))
  }
  getCampaignsNameAndKey() {
    return this.api.listPublic(this.queries.getCampaignsNameAndKey())
  }
  getPackageWithPeriodsAndProductNames(packageKey) {
    return this.api.getPublic(this.queries.getPackageWithPeriodsAndProductNames(packageKey));
  }
  getPeriodsAndProductNamesFromCurrentPeriod(packageKey, currentPeriod) {
    return this.api.listPublic(this.queries.getPeriodsAndProductNamesFromCurrentPeriod(packageKey, currentPeriod))
  }
  getPackagesByCampDiv(campaignDivKey) {
    return this.api.listPublic(this.queries.getPackagesByCampDiv(campaignDivKey))
  }
  getDivTabs(campaignDivKey) {
    return this.api.listPublic(this.queries.getDivTabs(campaignDivKey))
  }
  getPackages() {
    return this.api.listPublic(this.queries.getPackages())
  }
  getCampaignUploads(key) {
    return this.api.listPublic(this.queries.getCampaignUploads(key))
  }
  getNotesByCampaignKey(key) {
    return this.api.listPublic(this.queries.getNotesByCampaignKey(key))
  }
  getSuppliers() {
    return this.api.listPublic(this.queries.getSuppliers())
  }
  getFullBookingDivisions() {
    return this.api.listPublic(this.queries.getFullBookingDivisions())
  }
  getBookingDivisions() {
    return this.api.listPublic(this.queries.getBookingDivisions())
  }
  createPeriods(periods) {
    return this.api.createPublic(this.queries.createPeriods(periods), periods)
  }
  async createBookings(bookings) {

    const result = await this.api.createPublic(this.queries.createBookings(bookings), bookings)

    let socketLib = new SocketLibrary()
    await socketLib.transmit('All')

    return result

  }
  createCampaign(data) {
    return this.api.createPublic(this.queries.createCampaign(data), data, 'campaignKey')
  }
  createCampaignNotes(data) {
    return this.api.createPublic(this.queries.createCampaignNotes(data), data, 'campaignNoteKey')
  }
  createProductAndReturnKey(product) {
    return this.api.createPublic(this.queries.createProductAndReturnKey(product), product, 'productKey', true, true)
  }
  createProduct(product) {
    return this.api.createPublic(this.queries.createProduct(product), product, 'productKey')
  }
  createUploads(data) {
    return this.api.createPublic(this.queries.createUploads(data), data, 'uploadsKey')
  }
  async createManyPackages(data) {
    let results = []
    for await(const dat of data) {
      let result = await this.api.createPublic(this.queries.createPackage(dat), dat, 'packageKey')
      results.push(result)
    }

    return results
  }
  async createManyProducts(data) {
    let results = []
    for await(const dat of data) {
      let result = await this.api.createPublic(this.queries.createProduct(dat), dat, 'productKey')
      results.push(result)
    }

    return results
  }
  updateCampaign(key, data) {
    return this.api.updatePublic(this.queries.updateCampaign(key, data), data)
  }
  updateCampaignNotes(key, data) {
    return this.api.updatePublic(this.queries.updateCampaignNotes(key, data), data)
  }
  updatePackage(key, data) {
    return this.api.updatePublic(this.queries.updatePackage(key, data), data)
  }
  updateProduct(key, product) {
    return this.api.updatePublic(this.queries.updateProduct(key, product), product)
  }
  deletePeriod(key) {
    return this.api.deletePublic(this.queries.deletePeriod(key))
  }
  deletePeriodsByPackageKeyAndPeriod(key, period) {
    return this.api.deletePublic(this.queries.deletePeriodsByPackageKeyAndPeriod(key, period))
  }
  async deletePackage(key) {
    // Deleting a product should also delete any periods
    // that are associated with the product.
    return this.api.deletePublic(this.queries.deletePackage(key))
  }
  async deleteProduct(key) {
    // Deleting a product should also delete any periods
    // that are associated with the product.
    await this.api.deletePublic(this.queries.deleteProductPeriod(key))
    return this.api.deletePublic(this.queries.deleteProduct(key))
  }
  deleteNotes(key) {
    return this.api.deletePublic(this.queries.deleteNotes(key))
  }
  deleteCampaign(key) {
    return this.api.deletePublic(this.queries.deleteCampaign(key))
  }
}
