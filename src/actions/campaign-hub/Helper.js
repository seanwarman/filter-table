import moment from 'moment'
import { message } from 'antd'
import uuid from 'uuid'

export default class Helper {
  constructor(apiKey) {
    this.targetKeywords = []
  }

  checkAndSetDueDate(dueDate, relativeDueDate) {
    // Sometimes we want to manually set the dueDate but if not we get it from the campaign's relativeDueDate
    if(!moment.isMoment(dueDate)) {

      // If it's not there for whatever reason the default is 1 month.
      // dueDate = campaign.relativeDueDate ? moment().add(...campaign.relativeDueDate).format('YYYY-MM-DD') : moment().add(1, 'months').format('YYYY-MM-DD') 
      return moment().add(...relativeDueDate).format('YYYY-MM-DD')

    } else {

      // If it's a moment we'll want to change it to a string.
      return dueDate.format('YYYY-MM-DD')
    }
  }

  buildBookingForCampaign({
    dueDate,
    campaign,
    product,
    currentStatus,
    groupKey = null,
    append = ''
  }) {

    // The bookingTemplate has been included in the products query
    // as a nested json item. This is a bit bespoke and would be better
    // if the query was included in this function to keep them together.
    // Consider this a TODO.
    let bookingTemplate = product.bookingTemplate[0]


    // Take out the columns that aren't compatible with
    // actual bookings
    const {
      actualDivKey,
      bookingTmpKey,
      packageKey,
      ...bookingFromTemplate
    } = bookingTemplate


    const bookingsKey = uuid.v1(),
          bookingName = bookingTemplate.bookingName + append,

          customerKey = campaign.customerKey,
          partnerKey  = campaign.partnerKey,
          campaignKey = campaign.campaignKey,

          periodKey   = product.period,
          createdPartnerKey = partnerKey,
          createdUserKey    = 'cafc9f20-deae-11e9-be90-7deb20e96c9e'


    return {
      ...bookingFromTemplate,
      dueDate,
      groupKey,
      currentStatus,
      bookingsKey,
      bookingName,
      customerKey,
      partnerKey,
      campaignKey,
      periodKey,
      createdPartnerKey,
      createdUserKey,
      jsonForm: this.autoFillJsonForm(bookingFromTemplate.jsonForm, campaign, product),
      ...this.autoFillBookingFields(campaign)
    }

  }

  buildBookings(products, campaign, currentStatus, dueDate) {

    console.log('products: ', products)

    let bookings = []

    try {
      products.forEach(product => {

        if((product.quantity || 0) > 1) {

          let quantity = product.quantity

          // If there are more than one booking in this product
          // make a group of bookings with a groupKey and different
          // bookingsKeys each, they'll also need their own autofill items.
          for(let i = 0; i < quantity; i++) {
            bookings.push(this.buildBookingForCampaign({
              dueDate,
              campaign,
              product,
              currentStatus,
              groupKey: uuid.v1(),
              append: ` (${i+1} of ${quantity})`
            }))
          }

        } else {

          // If this is a single quantity product just make one booking for it.
          bookings.push(this.buildBookingForCampaign({
            dueDate,
            campaign,
            product,
            currentStatus,
          }))

        }
      })

    } catch (err) {
      
      console.log('There was an error iterating the products: ', err)
      return null
    }

    return bookings

  }

  async activateBookingsAndUpdateCampaign(campaign, pendingBookings, index, currentStatus = 'Draft', dueDate = null) {


    this.targetKeywords = campaign.targetKeywords || []

    dueDate = this.checkAndSetDueDate(dueDate, campaign.relativeDueDate)

    let { products } = pendingBookings[index]


    const bookings = this.buildBookings(products, campaign, currentStatus, dueDate)

    if(!bookings) return 'Fail'
      

    if((this.targetKeywords || []).length === 0) {
      message.warn('There are no target keywords in this campaign. Bookings have been created without them.', 10)
    }


    if(!(campaign.relativeDueDate || []).length === 0) {
      message.warn('This campaign has no relative due date set. Defaulting to one month from now.', 10)
    }

    return { bookings, campaign: {targetKeywords: this.targetKeywords}}

  }

  autoFillBookingFields(campaign) {


    const { hotLinks } = campaign

    if(!hotLinks || hotLinks?.length === 0) return {}

    let booking = {}


    hotLinks.forEach(hotLink => booking[hotLink.to] = campaign[hotLink.from])

    return booking

  }

  autoFillJsonForm(jsonForm, campaign, product) {

    // Detach newJsonForm from jsonForm so we don't effect the original.
    let newJsonForm = JSON.parse(JSON.stringify( jsonForm )) || []

    // First check the autoFillLabels array on the product.

    if((product.autoFillLabels || []).includes('Target Keywords')) {
      newJsonForm = newJsonForm.filter(json => 
        json.label !== 'Target URL' &&
        json.label !== 'Target Keywords'
      )
      .concat(
        ...this.addTargetKeywordsAndCustomerURL(product),
      )

    }

    if((product.autoFillLabels || []).includes('Citation')) {
      newJsonForm.push(...this.addCitation(product, campaign))
    }



    newJsonForm = newJsonForm.map(json => 
      this.addValsFromAutoFillLabels(json, product, campaign)
    )

    return newJsonForm
  }

  addValsFromAutoFillLabels(json, product, campaign) {

    let strategy = ''

    if(campaign.campaignDivName && product.packageName) {
      strategy = campaign.campaignDivName + ' ' + product.packageName
    }

    if(json.label === 'Bigg Spend') return {
      ...json,
      value: product.costPrice
    }
    if(json.label === 'Booking Month') return {
      ...json,
      value: moment().format('MMMM')
    }
    if(json.label === 'Campaign URL' || json.label === 'Customer URL') return {
      ...json,
      value: campaign.campaignUrl
    }
    if(json.label === 'Strategy') return {
      ...json,
      value: strategy
    }
    return json
  }

  addCitation(product, campaign) {
    if( !(product.autoFillLabels || []).includes('Citation') ) return []

    let citation = ''
    if((campaign.citationText || '').length > 0) citation = campaign.citationText

    return [
      {
        label: 'Citation',
        value: citation,
        prettyType: 'Text',
        type: 'input',
        required: false
      }
    ]
  }

  addTargetKeywordsAndCustomerURL(product) {
    if( !(product.autoFillLabels || []).includes('Target Keywords') ) return []
    if(this.targetKeywords.length === 0) return []

    let keywordsObj = this.targetKeywords.shift()
    this.targetKeywords.push(keywordsObj)

    let priority = ''
    if(keywordsObj.priority) priority = ' *'

    return [
      {
        label: 'Target Keywords',
        value: keywordsObj.keyword + priority,
        prettyType: 'Text',
        type: 'input',
        required: true
      },
      {
        label: 'Target URL',
        value: keywordsObj.targetUrl,
        prettyType: 'Text',
        type: 'input',
        required: true
      }
    ]
  }

  // This sorts the periods records in order of their
  // period values then makes an array of period numbers
  // filling the gaps for missing period numbers.
  // So you'll always get a 'tabs' array of sequential
  // numbers: [1,2,3,4,5]
  parseTabs(periods, products, callback) {

    // TODO this helper controller should just have all the functions
    // needed for this parseTabs function rather than using a callback.

    if((periods || []).length === 0) return {
      tabs: [],
      maxPeriod: 0
    }

    periods = periods.sort((a,b) => a.period - b.period)

    const maxPeriod = periods[periods.length -1].period

    let tabs = []

    for(let i = 0; i < maxPeriod; i++) tabs[i] = i+1

    return callback(tabs, periods, products, maxPeriod)
  }

  // This does the same as above except it doesn't fill
  // in missing periods so you might get a 'tabs' array
  // that looks like: [1,3,4,5]
  parsePeriods(periods, products, callback) {
    if((periods || []).length === 0) return []
    periods = periods.sort((a,b) => a.period - b.period)

    let tabs = periods.reduce((arr, per) => {
      if(per.period === arr[arr.length - 1]) return arr
      return  [...arr, per.period]
    }, [])

    return callback(tabs, periods, products)
  }
}
