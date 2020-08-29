import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { API } from '../../libs/apiMethods'
import axios from 'axios'
import Actions from '../../actions/booking-hub/Actions'
import Helper from '../../actions/booking-hub/Helper'
import Handlers from '../../actions/booking-hub/Handlers'
import config from '../../libs/BigglyConfig'
import { 
  DatePicker, 
  Input, 
  Badge, 
  Tabs, 
  Table, 
  Card, 
  Layout, 
  Icon, 
  Tag, 
  Row, 
  Col, 
  Button, 
  Tooltip, 
  message, 
  InputNumber, 
  Form, 
  Select, 
  Menu,
  Dropdown,
  Drawer,
} from 'antd'
import moment from 'moment'
import SocketLibrary from '../../libs/SocketLibrary'
import colorPicker from '../../libs/bigglyStatusColorPicker'
import colors from '../../mixins/BigglyColors'
import BookingProceed from '../Bookings/BookingProceed'
import BulkEditDrawer from '../Bookings/BulkEditDrawer.js'
import BookingTabs from '../Bookings/BookingTabs'
import './BookingsTable.css'
import 'antd/dist/antd.css'

const CancelToken = axios.CancelToken

const { Search } = Input
const { Content } = Layout
const { RangePicker } = DatePicker

let cancelFilterOption
let typingTimer
let cancelTokens = {
  bookingsFiltered: null,
  filterOptions: null
}

function generateCancelToken(type) {
  if(!type) throw new Error('There must be a type passed to generateCancelToken')
  return new CancelToken(c => cancelTokens[type] = c)
}

// KEEP: all endpoints in here are to be updated to jsequel but they're very bespoke so
// it's on the TODO list.

export default class BookingsTable extends Component {

  constructor(props) {
    super(props)
    this.socketLib = new SocketLibrary()
    this.helper = new Helper(props.user.apiKey)
    this.actions = new Actions(props.user.apiKey, props.user.userKey)
    this.state = {
      defaultTab: '',
      currentTab: null,
      loading: false,
      bookings: [],
      loadingMoreBookings: false,
      loadCompletedBookingsFrom: 0,
      loadedCompletedBookings: false,

      // These are the default jsonStatus for every division...
      jsonStatus: [
        { value: 'Draft' },
        { value: 'Live' },
        { value: 'In Progress' },
        { value: 'Complete' }
      ],
      partnerKey: null,
      division: null,
      assignedUser: null,
      bookingDivKey: null,

      tabLoading: {
        Draft: false,
        Live: false,
        Complete: false,
        All: false,
      },

      loadFrom: {
        Draft: 0,
        Live: 0,
        Complete: 0,
        All: 50,
      },
      // filter options...
      bookingsFiltered: [],
      customFilter: false,
      jsonFilter: null,
      jsonFilterSelectedCount: 0,
      filtersClear: true,
      filterLoading: false,
      disableFilterOptions: false,
      maxFilterBookings: 1000,
      maxSearchBookings: 1000,
      sortBy: 'dueDate',
      hideFilter: true,

      searchTerm: '',
      searchLoading: false,
      searchTab: false,
      bookingsSearched: [], 
      createdFilterDates: [],
      dueFilterDates: [],
      completedFilterDates: [],
      ascOrDesc: 'asc',

      // These are all the keys from the state
      // that are allowed to be saved to the user's jsonState
      jsonStateKeys: [
        'ascOrDesc',
        'currentTab',
        'maxFilterBookings',
        'maxSearchBookings',
        'sortBy',
        'hideFilter',
        'bookingDivKey',
        'jsonFilter',
        'jsonFilterSelectedCount',
        'customFilter',
        'createdFilterDates',
        'completedFilterDates',
        'dueFilterDates',
        'partnerKey',
      ],
      jsonState: {},
      bookingStateRecords: [],
      bookingStateName: '',
      showSavedStateDrawer: false,

      handlers: null,
      currentBooking: {},
      bookingTabDrawerVisible: false,

      // Bulk edit fields
      selectedRowKeys: [],
      rowSelection: false,
      saveBulkEnabled: false,
      bulkCommentSaving: false,

      bookingsTableLoading: false,

      // TODO remove, for testing only
      dataIndexes: [],
    }
  }


  parseJsonStateFromState = stateItems => {
    const { jsonStateKeys } = this.state

    let changed = false

    const newJsonState = jsonStateKeys.reduce((obj, key) => {
      if(stateItems[key] === undefined) return obj
      changed = true
      return Object.assign(obj, {[key]: stateItems[key]})
    },{})
    if(changed) return newJsonState
    return
  }

  setStateWithoutUpdate = this.setState

  setState = async (stateItems) => {
    if(!stateItems) return
    if(stateItems.currentTab && (stateItems || {}).currentTab !== this.state.currentTab) stateItems.selectedRowKeys = []
    await this.setStateWithoutUpdate(stateItems)

    const jsonState = this.parseJsonStateFromState(stateItems)
    if(!jsonState) return


    await this.props.handleUpdateUser(
      this.props.user.apiKey,
      this.props.user.userKey,
      {jsonState: {...this.props.user.jsonState, ...jsonState }}
    )

  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  async componentDidMount() {

    // console.log('adding to event...')
    document.addEventListener('scroll', this.trackScrolling);

    // Set silentReload to be triggered when a 'Booking' channel socket event is recieved.
    // This will reload all the bookings and the filter options if there's been any updates
    // from someone else using BMS.
    this.socketLib.addSocketEvent(this.props.bookingDivKey, this.silentReload)


    this.setStateWithoutUpdate({ bookingsTableLoading: true })

    await this.loadDataAndSetState()

    // TODO: what's this return for?
    // return
    // await this.setStateWithoutUpdate({rowSelection: true})

  }

  componentWillUnmount() {
    // Cancel any un-resolved fetches, these are for
    // our custom ones...
    Object.keys(cancelTokens).forEach(key => {
      if(cancelTokens[key]) cancelTokens[key]()
    })

    // This is for our general fetches...
    this.actions.api.cancelFetches()

    // Remove the scroll event listener
    document.removeEventListener('scroll', this.trackScrolling);

    // Close the websocket connection
    this.socketLib.forceClose()
  }

  trackScrolling = () => {
    const { currentTab, loadFrom } = this.state

    if(loadFrom[currentTab] < 20) return

    const wrappedElement = document.getElementById('app-wrapper');


    if (this.isBottom(wrappedElement)) {
      // Only gets load button from active tab
      var loadmore = document.querySelector('.ant-tabs-tabpane-active .load-button');
      // Checks if load button exists then runs
      if(loadmore){
        loadmore.click();
      }
    }
  };

  loadDataAndSetState = async() => {

    // First we want to initialise the state from the stateRecord belonging to this user.
    let state = this.getOrResetStateRecord()


    state.partnerKey = this.props.user.partnerKey
    state.bookingDivKey = this.props.bookingDivKey

    // The initial status tab is different depending on the user's accessLevel
    state.defaultTab = this.getDefaultTabByAccessLevel(this.props.user.accessLevel)

    // Give the user something to look at.
    this.setStateWithoutUpdate({currentTab: state.defaultTab})

    // Get the bookingDivision record from this bookingDivKey...
    state.division = await this.getBookingDiv(
      this.props.user.apiKey,
      this.props.bookingDivKey
    )

    // Get this user's saved filters.
    state.bookingStateRecords = await this.getBookingStates(
      this.props.user.apiKey,
      this.props.user.userKey,
      this.props.bookingDivKey
    )

    // Add everything we've gotten so far to the state, making sure
    // not to override anything we might have gotten from the stateRecord.
    state.jsonStatus = (state.division || {}).jsonStatus


    // If the users stateRecord was loaded in jsonFilter should be on state.
    //
    // If there's no jsonFilter record this function will load in new options.
    // If there are already options this function will merge the new available
    // options with the ones already saved to the stateRecord.
    // state.jsonFilter = await this.handleFilterOptions(state.jsonFilter)


    // Finally pass our state object into silentReload which will
    // load the actual bookings and set them to this.state
    await this.silentReload(state)






    //     await this.setStateWithoutUpdate({jsonFilter})

//     let jsonState


//     this.setStateWithoutUpdate({rowSelection: true, loading: false, bulkCommentSaving: true})
  }

  getOrResetStateRecord = () => {

    if(
      // If the user has a jsonState and it's bookingDivKey is the same as the one on this component...
      this.props.bookingDivKey === (this.props.user.jsonState || {}).bookingDivKey &&
      // ...and if the user hasn't changed their partnerKey...
      this.props.user.partnerKey === (this.props.user.jsonState || {}).partnerKey
    ) {


      // Remove any items from the saved state record that don't match the jsonStateKeys
      // NOTE: jsonStateKeys holds a list of the currently allowed state record items.
      const jsonState = this.cleanJsonState(this.props.user.jsonState, this.state.jsonStateKeys)

      // Then add that jsonState's values to the state object 
      return { ...jsonState }

    } else {
      // Otherwise, just reset the user's state record and leave our state object blank
      this.resetJsonState(this.props.user.partnerKey, this.props.bookingDivKey)

    }

    return {}


  }

  resetJsonState = (partnerKey, bookingDivKey) => {
    // clear the users jsonState and add a partnerKey and bookingDivKey to it.
    this.props.handleUpdateUser(
      this.props.user.apiKey,
      this.props.user.userKey,
      {jsonState: JSON.stringify({partnerKey, bookingDivKey})}
    )

  }

  // █▀▀█ █▀▀█ █▀▀█ ▀█░█▀ ░▀░ █▀▀ ░▀░ █▀▀█ █▀▀▄ ░▀░ █▀▀▄ █▀▀▀
  // █░░█ █▄▄▀ █░░█ ░█▄█░ ▀█▀ ▀▀█ ▀█▀ █░░█ █░░█ ▀█▀ █░░█ █░▀█
  // █▀▀▀ ▀░▀▀ ▀▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀ ▀░░▀ ▀▀▀▀

  silentReload = async(state) => {



    // TODO: It would be nice to call this so that all current fetches are
    // cancelled but at the moment it breaks the view. I think this is because
    // getBookingsByParams needs to be getBookingsByParamsWCancel and maybe some of the
    // other functions also need to be their cancellable versions.
    //
    // await this.actions.api.cancelFetches()



    // Reload all the bookings without showing any loading icons
    // so that the view can update silently if we recieve the 'Bookings' channel websocket event.

    if(!state) state = { ...this.state }

    let {
      bookingDivKey,

      jsonFilterSelectedCount,
      ascOrDesc,
      jsonFilter,
      loadFrom,   // { All: Number, Draft: Number, Live: Number, Complete: Number }
      maxFilterBookings,
      maxSearchBookings,
      sortBy,
      loadedCompletedBookings,
      searchTerm,
    } = state


    let draftBookings = []
    let liveBookings = []
    let completedBookings = []
    let otherBookings = []


    // Load either the default values from the state or 
    // the bookings already on the state so silentReload
    // doesn't clear these from the user's view while updating.

    let bookingsFiltered = this.state.bookingsFiltered
    let bookingsSearched = this.state.bookingsSearched


    // Because all the limits might be different for each tab we have to 
    // get them separately.
    //
    // Load all normal bookings once for each tab, use the loadFrom object to
    // decide on where to load the bookings *up to* not *from* because loadFrom tells the 
    // 'Load From' button where to start from when getting *extra* bookings, we just want
    // to reload the *existing* bookings.

    let { Draft, Live, Complete } = loadFrom ? loadFrom : { Draft: 0, Live: 0, Complete: 0 }

    let limit = []

    // Load the Draft bookings
    // The loadFrom value gives us limit[1] - 20
    // so add 20 to it.

    if(Draft <= 20) limit = [0, 20]
    else limit = [0, Draft+20]


    draftBookings = await this.getBookingsAndFilterParams(
      [ 'bookings.currentStatus = "Draft"' ],
      ...limit
    )
    // console.log('draftBookings : ', draftBookings)

    // Load the Live bookings
    // The loadFrom value gives us limit[1] - 20
    // so add 20 to it.

    if(Live <= 20) limit = [0, 20]
    else limit = [0, Live+20]

    liveBookings = await this.getBookingsAndFilterParams(
      [ 'bookings.currentStatus = "Live"' ],
      ...limit
    )
    // console.log('liveBookings : ', liveBookings)


    // Do the 'Other' tabs all together without a limit because there's never as many of them
    // as the other tabs...
    otherBookings = await this.getBookingsAndFilterParams(
      [
        'bookings.currentStatus != "Draft"',
        'bookings.currentStatus != "Live"',
        'bookings.currentStatus != "Complete"',
      ]
    )
    // console.log('otherBookings : ', otherBookings)

    // If the Complete tab hasn't yet been loaded,
    // don't get them.
    if(loadedCompletedBookings) {

      // Otherwise grab them in the same way as Live and Draft.
      if(Complete <= 20) limit = [0, 20]
      else limit = [0, Complete+20]

      completedBookings = await this.getBookingsAndFilterParams(
        [ 'bookings.currentStatus = "Complete"' ],
        ...limit
      )
      // console.log('completedBookings : ', completedBookings)
    }

    // If there's a search term in the search input reload the searched bookings...
    if((searchTerm || '').length > 0) {
      // Reload all searched bookings
      bookingsSearched = await this.getfilterBookingsBySearchTerm(
        null,
        null,
        bookingDivKey,
        0,
        maxSearchBookings,
        searchTerm
      )
      // console.log('bookingsSearched : ', bookingsSearched)
    }


    if(!state.currentTab) state.currentTab = state.defaultTab

    state.bookingsSearched = bookingsSearched
    state.bookingsFiltered = bookingsFiltered
    state.bookings = [
      ...draftBookings,
      ...liveBookings,
      ...completedBookings,
      ...otherBookings,
    ]

    // Track how many bookings are loaded into each tab that
    // uses partial loading.
    state.loadFrom = {
      Draft: draftBookings.length,
      Live: liveBookings.length,
      Complete: completedBookings.length
    }

    state.bookingsTableLoading = false
    state.rowSelection = true

    await this.setStateWithoutUpdate(state)

    // Done loading normal tabs.


    // If there are filters selected in the Custom Filter reload bookingsFiltered
    // console.log('jsonFilterSelectedCount : ', jsonFilterSelectedCount)
    if(jsonFilterSelectedCount) {

      this.setState({filterLoading: true})


      // All these vars are required by getBookingsByParams so if any of them are
      // undefined we want to set them from the defaults in this.state
      sortBy = sortBy ? sortBy : this.state.sortBy
      maxFilterBookings = maxFilterBookings ? maxFilterBookings : this.state.maxFilterBookings
      ascOrDesc = ascOrDesc ? ascOrDesc : this.state.ascOrDesc



      // Reload all filters and filtered bookings
      bookingsFiltered = await this.getBookingsByParams(
        jsonFilter,
        sortBy,
        0,
        maxFilterBookings,
        ascOrDesc,
      )
      // console.log('bookingsFiltered : ', bookingsFiltered)
    }

    // Reload the filter options either way...
    // getFilterOptions
    let newJsonFilter = await this.handleFilterOptions(jsonFilter)
    // console.log('newJsonFilter : ', newJsonFilter)

    await this.setStateWithoutUpdate({
      filterLoading: false,
      jsonFilter: newJsonFilter,
      bookingsFiltered
    })

    // Done loading filter options

  }

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  getBookingStates = async (apiKey, userKey, bookingDivKey) => {
    const result = await this.actions.getBookingStates(userKey, bookingDivKey)
    return result
  }

  getFilterOptionsWCancel = async() => {

    if(cancelTokens.filterOptions) cancelTokens.filterOptions()

    let config = {
      cancelToken: generateCancelToken('filterOptions') 
    }

    return API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/division/${this.props.bookingDivKey}/bookings/options/count`, { 
        jsonFilterOptions: this.state.jsonFilter
      }, config
    )

  }

  getFilterOptions = async (jsonFilter) => {

    const jsonFilterOptions = jsonFilter ? jsonFilter : []
    let result
    // KEEP: this is the most custom endpoint we have and will need proper time to convert (if we even need to).
    try {
      result = await API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/division/${this.props.bookingDivKey}/bookings/options/count`, {
        jsonFilterOptions
      })
    } catch (error) {
      console.log('error :', error)
      return null
    }
    // Sorry about this but for testing purposes the result here is an object with 'result' and 'queryString' on it.
    return result.result
  }

  getBookingDiv = async (apiKey, bookingDivKey) => {
    return await this.actions.getBookingDiv(bookingDivKey)
  }

  getfilterBookingsBySearchTerm = async (apiKey_, userKey_, bookingDivKey, start_, end, searchTerm) => {

    const { user } = this.props

    const where = this.helper.makeSearchTermWhere(user, bookingDivKey, searchTerm)
    const result = this.actions.getBookingsTableBookings([where.join(' AND ')], [0, end])

    return result
  }

  getBookingsByParamsWCancel = async() => {

    if(cancelTokens.bookingsFiltered) cancelTokens.bookingsFiltered()

    let config = {
      cancelToken: generateCancelToken('bookingsFiltered')   
    }

    let res = await API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/division/${this.props.bookingDivKey}/bookings/sort/${this.state.sortBy}/0/${this.state.maxFilterBookings}/${this.state.ascOrDesc}`, {
        jsonFilterOptions: this.state.jsonFilter
    }, config)
    console.log('bookings: ', res)
    return res
  }

  getBookingsByParams = async (jsonFilterOptions, sortBy, start, end, ascOrDesc) => {
    let result
    // KEEP: custom endpoint
    try {
      result = await API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/division/${this.props.bookingDivKey}/bookings/sort/${sortBy}/${start}/${end}/${ascOrDesc}`, {
        jsonFilterOptions
      })
    } catch (error) { 
      console.log('There was an error getting the bookings: ', error)
      return null
    }
    return result
  }

  getBookingsAndFilterParams = async (where, start, end) => {
    let limit = []

    if(typeof start === 'number' && typeof end === 'number' ) limit = [start, end]

    where = [
      ...where,
      ...this.helper.filterPausedBookings(),
      ...this.helper.makeAccessLevelWhere(this.props.user),
      `bookingDivKey = "${this.props.bookingDivKey}"`,
    ]

    const result = await this.actions.getBookingsTableBookings(where, limit)

    return result
    // KEEP: custom endpoint
    // try {
    //   return await API.put('biggly', `/bookingpublic2/key/${apiKey}/user/${userKey}/bookings/${start}/${end}`, {
    //     body: {
    //       jsonFilter
    //     }
    //   })
    // } catch (error) {
    //   console.log('There was an error getting the bookings by div key and status filter: ', error)
    //   return null
    // }
  }

  // █░░█ ▀▀█▀▀ ░▀░ █░░ ░▀░ ▀▀█▀▀ ░▀░ █▀▀ █▀▀
  // █░░█ ░░█░░ ▀█▀ █░░ ▀█▀ ░░█░░ ▀█▀ █▀▀ ▀▀█
  // ░▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀

  getDefaultTabByAccessLevel(accessLevel) {
    if(!accessLevel) return 'Live'
    if(accessLevel === 'Supplier') return 'Live'
    if(accessLevel === 'Supplier Admin') return 'Live'
    if(accessLevel === 'Admin') return 'Draft'
    if(accessLevel === 'Provider') return 'Draft'
    if(accessLevel === 'Provider Admin') return 'Draft'
  }

  updateRenderedBookings = (type) => {
    let stateCopy = {...this.state}
    stateCopy.currentBooking[type]++
    this.setState(stateCopy)
  }

  cleanJsonState = (jsonState, jsonStateKeys) => {
    return Object.keys(jsonState).reduce((obj,key) => {
      if(!jsonStateKeys.includes(key)) return obj
      obj[key] = jsonState[key]
      return obj
    },{})
  }

  badgeOffset = tab => (
    tab === 'Complete' ||
    tab === 'Draft' ||
    tab === 'Live' ||
    tab === 'All' ?
    [25, -5]
    :
    [15, -5]
  )

  monthOrder = month => {
    const monthOrder = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12
    }
    return monthOrder[month]
  }

  filterSorting = (a, b, item) => {
    if(item.prettyName === 'Status') {
      if (this.statusOrder(a) > this.statusOrder(b)) return 1
      if (this.statusOrder(a) < this.statusOrder(b)) return -1
      return 0
    }
    if(item.prettyName === 'Booking Month') {
      if (this.monthOrder(a) > this.monthOrder(b)) return 1
      if (this.monthOrder(a) < this.monthOrder(b)) return -1                                                                                                                           
      return 0
    }
    if(item.type === 'string') {
      const valA = a.toUpperCase()
      const valB = b.toUpperCase()
      if(valA < valB) {
        return -1
      }
      if(valA > valB) {                                                                                                                                                                                                                                                                                                                                           
        return 1
      }
      return 0
    }
    if(item.type === 'number') {
      return a - b
    }
  }

  statusOrder = status => {
    const statusOrder = {
      Draft: 1,
      Live: 2,
      "In Progress": 3,
      Other: 4,
      Complete: 5
    }
    return statusOrder[status] || statusOrder.Other
  }

  sortDate = (a, b, key) => {
    if (!a[key]) return 1
    if (!b[key]) return -1
    const A = moment(a[key])
    const B = moment(b[key])
    if (A > B) {
      return 1
    }
    if (A < B) {
      return -1
    }
    return 0
  }

  sortByNumberOrAlpha = (a, b, key, type) => {
    if (type === 'string') {
      let A = JSON.stringify(a[key]).toUpperCase()
      let B = JSON.stringify(b[key]).toUpperCase()
      return A === B ? 0 : A < B ? -1 : 1
    } else if (type === 'number') {
      return Number(a[key]) - Number(b[key])
    } else {
      console.log('Not a recognised type: ', key)
    }
  }

  formatDataByKey = (key, value) => {
    if (!value) return null

    if (key === 'created' || key === 'dueDate') {
      value = new moment(value).format('ll')
    }

    if (key === 'status') {
      let statusObj = colors.status.find(item => (
        item.value === value ?
          item
          :
          item.value === 'Default' &&
          item
      ))
      value = <Tag color={statusObj.colorLabel}><Icon type={statusObj.icon} /> {value}</Tag>
    }

    return value
  }

  filterColumnsByTab = (columns) => {
    const { currentTab, division } = this.state

    if (currentTab !== 'All' || division !== null) {
      columns = columns.filter(column => column.dataIndex !== 'status')
    }

    if (currentTab !== 'Complete' && currentTab !== 'All') {
      columns = columns.filter(column => column.dataIndex !== 'completedDate')
    }

    return columns
  }

  filterBookingsBySearchTerm = bookings => {
    const { searchTerm } = this.state
    const regex = new RegExp(escape(searchTerm), 'gi')
    return bookings.filter(booking => {
      let condition = false
      for (let i in booking) {
        let value = JSON.stringify(booking[i])
        if (value.search(regex) > -1) {
          condition = true
        }
      }
      return booking && condition
    })
  }

  filterBookingsByTab = (bookings, tab) => {
    
    if (tab && tab !== 'All') {
      bookings = bookings.filter(booking => booking.currentStatus === tab)
    }

    if (tab === 'All') {
      bookings = bookings.filter(booking => booking.currentStatus !== 'Complete')
    }

    return bookings
  }

  // █▀▀ █░░█ █▀▀ ▀▀█▀▀ █▀▀█ █▀▄▀█   █▀▀ ░▀░ █░░ ▀▀█▀▀ █▀▀ █▀▀█
  // █░░ █░░█ ▀▀█ ░░█░░ █░░█ █░▀░█   █▀▀ ▀█▀ █░░ ░░█░░ █▀▀ █▄▄▀
  // ▀▀▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀ ▀░░░▀   ▀░░ ▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀░▀▀

  listBookingsByFilterOptions = async (jsonFilter, sortBy, maxFilterBookings, ascOrDesc) => {
    if(jsonFilter.length === 0) return []
    if(!ascOrDesc) ascOrDesc = this.state.ascOrDesc

    return await this.getBookingsByParams(jsonFilter, sortBy, 0, maxFilterBookings, ascOrDesc)
  }

  selectFilterDateRange = (dataIndex, moments) => {
    let dateRange = []
    if(moments.length > 0) {
      dateRange[0] = moments[0].format('YYYY-MM-DDT00:00:00.000Z')
      dateRange[1] = moments[1].format('YYYY-MM-DDT23:59:59.999Z')

      this.selectFilterOption(dataIndex, dateRange, 'date')
    } else {

      if(this.state.jsonFilterSelectedCount <= 1) {
        this.clearFilterOptions()
      } else {
        this.selectFilterOption(dataIndex, [], 'date')
      }

    }

    if(dataIndex === 'created') this.setState({createdFilterDates: dateRange})
    if(dataIndex === 'completedDate') this.setState({completedFilterDates: dateRange})
    if(dataIndex === 'dueDate') this.setState({dueFilterDates: dateRange})
  }


  countJsonFilterSelections = jsonFilter => {
    return jsonFilter.reduce((num,item) => {
      item.options.forEach(optionItem => {
        if(optionItem.selected) num++
      })
      return num
    },0)
  }

  loadBookingsAndFilterOptions = async (jsonFilter, sortBy, maxFilterBookings, ascOrDesc, reloadFilter) => {
    this.setState({
      filterLoading: reloadFilter,
      disableFilterOptions: true,
    })

    let state = {
      filterLoading: false,
      disableFilterOptions: false,
      jsonFilter: {},
      bookingsFiltered: [],
      jsonFilterSelectedCount: 0
    }
    // The filter options may have changed since the user last came here so reload them...
    state.jsonFilter = await this.handleFilterOptions(jsonFilter)
    state.jsonFilterSelectedCount = this.countJsonFilterSelections(state.jsonFilter)
    if(state.jsonFilterSelectedCount > 0) {
      state.bookingsFiltered = await this.listBookingsByFilterOptions(state.jsonFilter, sortBy, maxFilterBookings, ascOrDesc)
      if(state.bookingsFiltered.length === 0) message.warn('No bookings to show for this date range.')
    } else {
      state.customFilter = false
      if(state.currentTab === 'Filter') {
        state.currentTab = this.state.defaultTab
      }
    }
    this.setState(state)
  }

  selectFilterOption = async(dataIndex, option, type) => {

    // Set the filterOptions and the count of filter options selected on the
    // state so that the options highlight in the view.
    // This also sets the number of filter options selected.

    await this.setState({
      ...this.addOptionToFilterSelection(dataIndex, option, type),
      currentTab: 'Filter',
      filterLoading: true,
    })

    // Cancel the last setTimout so we don't do any calls
    // too early...
    clearTimeout(cancelFilterOption)


    // Run the setTimeout.
    cancelFilterOption = setTimeout(async() => {

      let bookingsFiltered = []
      let currentTab = 'Filter'

      // Now check and see if there are any options selected.
      if(this.state.jsonFilterSelectedCount > 0) {

        // If there are...
        // Get the bookings by selected filter options, passing in a new cancel
        // token in case the user chooses another one.

        bookingsFiltered = await this.getBookingsByParamsWCancel()

        if(bookingsFiltered.length === 0) message.info('No bookings match the selected filter options.')

      } else {

        // If there's no options selected, switch back to the default tab.
        currentTab = this.state.defaultTab
      }


      // Either way update the state with either an empty array for the bookings
      // or the bookings by filter options.
      this.setState({bookingsFiltered, currentTab, filterLoading: false})


      // Now after the bookings are loaded, reload the filter options.
      const options = await this.getFilterOptionsWCancel()

      // The endpoint returns them in a funny format so we have to convert them first.
      const jsonFilter = this.convertFilterOptions(options.result)

      // Keep track of how many options are selected in the UI.
      const jsonFilterSelectedCount = this.countJsonFilterSelections(jsonFilter)

      this.setState({jsonFilter, jsonFilterSelectedCount})
    }, 1000)
  }

  convertFilterOptions = options => {
    if(!options) {
      message.error('Couldnt get the filter options. There might be something wrong with the network.')
      return []
    }
    if(options.length === 0) return this.state.jsonFilter

    let newFilterOptions = options.reduce((arr,item) => {

      let {dataIndex, option, count, prettyName, type} = item

      let i = arr.findIndex(findItem => findItem.dataIndex === dataIndex)
      let selected = false
      let optionItem

      if(type !== 'date') {
        optionItem = (((this.state.jsonFilter || []).find(optnItem => optnItem.dataIndex === dataIndex) || {}).options || [])
        .find(optnsItem => optnsItem.option === option)
  
        if(optionItem) {
          selected = optionItem.selected ? true : false
        }

        if(i === -1) {
          return [...arr, { dataIndex, prettyName, type, options: [{option, count, selected}] }]
        }

        arr[i].options.push({option, count, selected})
      } 

      if(type === 'date') {
        optionItem = (this.state.jsonFilter || []).find(optnItem => optnItem.dataIndex === dataIndex)

        if(optionItem) {
          return [...arr, { dataIndex, prettyName, type, options: optionItem.options }]
        } else {
          return [...arr, { dataIndex, prettyName, type, options: [] }]
        }
      }

      return arr
    },[])

    return newFilterOptions
  }



  addOptionToFilterSelection = (dataIndex, option, type) => {
    let { jsonFilter, jsonFilterSelectedCount } = this.state

    if(type === 'date') {
      // If it's a date type the option param is always an array of two objects
      for (let o of jsonFilter) {
        if (o.dataIndex === dataIndex) {

          if(option.length > 0 && ((o.options[0] || {}).option || []).length === 0) {
            jsonFilterSelectedCount++
          }
          if(option.length === 0 && ((o.options[0] || {}).option || []).length > 0) {
            jsonFilterSelectedCount--
          }

          o.options = [{option: option, selected: option.length > 0}]
          break
        }
      }

    } else {
      for (let o of jsonFilter) {
        if (o.dataIndex === dataIndex) {
          o.options = o.options.map(item => {
            if(item.option === option) {
              item.selected = !item.selected;

              (
                item.selected ? 
                jsonFilterSelectedCount++
                :
                jsonFilterSelectedCount--
              )
            }
            return item
          })
          break
        }
      }
    } 

    return { jsonFilter, jsonFilterSelectedCount }
  }

  clearFilterOptions = async() => {
    // Cancel the last request for filter options, this call
    // will be replacing it.
    if(cancelTokens.filterOptions) cancelTokens.filterOptions()
    if(cancelTokens.bookingsFiltered) cancelTokens.bookingsFiltered()

    this.setState({
      completedFilterDates: [],
      createdFilterDates: [],
      dueFilterDates: [],
      bookingsFiltered: [],
      jsonFilterSelectedCount: 0,
      currentTab: this.state.defaultTab,
      disableFilterOptions: true,
    })

    let jsonFilter = await this.handleFilterOptions([])

    this.setState({
      jsonFilter,
      disableFilterOptions: false,
    })
  }

  handleFilterOptions = async (jsonFilter) => {
    jsonFilter = jsonFilter || []
    let options = await this.getFilterOptions(jsonFilter)
    if(!options) {
      message.error('Couldnt get the filter options. There might be something wrong with the network.')
      return []
    }
    if(options.length === 0) return jsonFilter

    let newFilterOptions = options.reduce((arr,item) => {

      let {dataIndex, option, count, prettyName, type} = item

      let i = arr.findIndex(findItem => findItem.dataIndex === dataIndex)
      let selected = false
      let optionItem

      if(type !== 'date') {
        optionItem = (((jsonFilter || []).find(optnItem => optnItem.dataIndex === dataIndex) || {}).options || [])
        .find(optnsItem => optnsItem.option === option)
  
        if(optionItem) {
          selected = optionItem.selected ? true : false
        }

        if(i === -1) {
          return [...arr, { dataIndex, prettyName, type, options: [{option, count, selected}] }]
        }

        arr[i].options.push({option, count, selected})
      } 

      if(type === 'date') {
        optionItem = (jsonFilter || []).find(optnItem => optnItem.dataIndex === dataIndex)

        if(optionItem) {
          return [...arr, { dataIndex, prettyName, type, options: optionItem.options }]
        } else {
          return [...arr, { dataIndex, prettyName, type, options: [] }]
        }
      }

      return arr
    },[])

    return newFilterOptions
  }

  // █▀▀█ █▀▀█ █░░█ ▀▀█▀▀ █▀▀ █▀▀
  // █▄▄▀ █░░█ █░░█ ░░█░░ █▀▀ ▀▀█
  // ▀░▀▀ ▀▀▀▀ ░▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀

  viewBookingForm = () => {
    this.props.history.push(this.props.newBookingRoute)
  }

  // █▀▀ ▀█░█▀ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // █▀▀ ░█▄█░ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  onSearchTerm = e => {
    this.setState({ searchTerm: e.target.value })
  }

  onChangeMaxBookings = num => {
    this.setState({maxFilterBookings: num})
  }
  
  onKeyUpEnterFilter = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      if(this.state.jsonFilterSelectedCount === 0) return
      if(!e.target.value) return
      this.handleFilterBookings(this.state.sortBy, e.target.value, this.state.ascOrDesc)
    }
  }
  
  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  handleCopyKey = bookingsKey => {
    let el = document.createElement('textarea')
    el.value = bookingsKey
    el.setAttribute('readonly', '')
    el.style = {display: 'none', "pointer-events": 'none'}
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    message.success('Bookings Key copied.')
  }

  handleBookingStateName = e => {
    this.setState({bookingStateName: e.target.value})
  }

  handleDeleteStateRecord = async (bookingStateKey, index) => {
    this.actions.deleteStateRecord(bookingStateKey)
    let { bookingStateRecords } = this.state
    bookingStateRecords.splice(index, 1)
    this.setState({ bookingStateRecords })
  }
  
  handleAddStateRecord = async() => {

    if(this.state.bookingStateName.length === 0) return

    const jsonState = this.parseJsonStateFromState(this.state)
    if(!jsonState) return
    
    let result = await this.actions.addStateRecord(
      this.state.bookingStateName,
      this.props.user.userKey,
      this.state.bookingDivKey,
      jsonState
    )

    const bookingStateRecords = await this.getBookingStates(
      this.props.user.apiKey,
      this.props.user.userKey,
      this.props.bookingDivKey
    )
    
    let showSavedStateDrawer = false
    let bookingStateName = ''

    this.setState({bookingStateRecords, bookingStateName, showSavedStateDrawer})

    if((result || {}).affectedRows > 0) message.success('Filter Saved!')
    else message.error('Filter save failed.')

  }

  handleSelectBookingState = async jsonState => {

    jsonState = this.cleanJsonState(jsonState, this.state.jsonStateKeys)

    // Add the jsonState's values to the this.state...
    await this.setState({...jsonState})

    // Reload the bookings and filter options... 
    await this.loadBookingsAndFilterOptions(
      this.state.jsonFilter, 
      this.state.sortBy, 
      this.state.maxFilterBookings,
      this.state.ascOrDesc,
      true
    )
  }

  handleShowSavedStateDrawer = () => {
    this.setState({showSavedStateDrawer: true})
  }
  
  handleHideSavedStateDrawer = () => {
    this.setState({showSavedStateDrawer: false})
  }

  handleFilterBookings = async (sortBy, maxFilterBookings, ascOrDesc) => {

    if(!maxFilterBookings) return
    this.setState({
      filterLoading: true,
      disableFilterOptions: true
    })
    let {jsonFilter} = this.state
    let bookingsFiltered = await this.listBookingsByFilterOptions(jsonFilter, sortBy, maxFilterBookings, ascOrDesc)

    this.setState({
      bookingsFiltered,
      maxFilterBookings,
      filterLoading: false,
      disableFilterOptions: false
    })
  }

  handleSortSelection = async selection => {
    await this.setState({
      sortBy: selection
    })
    if(this.state.jsonFilterSelectedCount > 0) {
      this.handleFilterBookings(selection, this.state.maxFilterBookings, this.state.ascOrDesc)
    }
  }
  
  handleSortDirection = async () => {
    await this.setState({ 
      ascOrDesc: this.state.ascOrDesc === 'desc' ? 'asc' : 'desc' 
    })
    if(this.state.jsonFilterSelectedCount > 0) {
      this.handleFilterBookings(this.state.sortBy, this.state.maxFilterBookings, this.state.ascOrDesc)
    }
  }

  handleHideFilter = bool => {
    this.setState({hideFilter: bool})
  }

  handleOnEnterSearch = () => {
    if(this.state.searchTerm.length === 0) return
    this.handleSearching()
  }

  handleSearching = async () => {
    if(this.state.searchTerm.length === 0) {
      this.handleClearSearch()
      return
    }

    this.setState({searchTab: true, searchLoading: true})
    let stateCopy = {...this.state}


    stateCopy.bookingsSearched = await this.getfilterBookingsBySearchTerm(
      this.props.user.apiKey,
      this.props.user.userKey,
      this.props.bookingDivKey,
      0, this.state.maxSearchBookings,
      this.state.searchTerm,
    )

    stateCopy.searchLoading = false
    stateCopy.currentTab = 'Search'
    this.setState(stateCopy)
  }

  handleClearSearch = () => {
    let stateCopy = {...this.state}
    stateCopy.searchTab = false
    stateCopy.searchLoading = false
    stateCopy.bookingsSearched = []
    stateCopy.currentTab = this.state.defaultTab
    this.setState(stateCopy)
  }
  
  handleApiSearch = e => {
    if (e.target.value.length > 0 && (e.which >= 48 || e.which <= 90)) {
      clearTimeout(typingTimer)
      typingTimer = setTimeout(() => {
        this.handleSearching()
      }, 800)
    } else {
      this.handleClearSearch()
    }
  }

  handleChangeMaxSearch = num => {
    this.setState({maxSearchBookings: num})
  }

  handleTotalValue = (dataIndex) => {
    let{bookingsFiltered, bookingsSearched, bookings, currentTab} = this.state
    if(currentTab === 'Filter') {
      return this.renderTotalValue(dataIndex, bookingsFiltered) 
    }
    if(currentTab === 'Search') {
      return this.renderTotalValue(dataIndex, bookingsSearched)
    }
    
    return this.renderTotalValue(dataIndex, this.filterBookingsByTab(bookings, currentTab))
  }

  handleClickBadge = (tab, loadMore) => {
    let stateCopy = { ...this.state }
    if(tab !== stateCopy.currentTab) return
    if(
      tab !== 'All' &&
      tab !== 'Draft' &&
      tab !== 'Live' &&
      tab !== 'Complete'
    ) return
    loadMore(tab)
  }

  handleGetBookingsByStatus = async(start, status, bookingDivKey) => {
    return await this.getBookingsAndFilterParams(
      [
        `currentStatus = "${status}"`
      ],
      start, 20,
      // [
      //   {
      //     key: 'bms_booking.bookings.bookingDivKey',
      //     value: bookingDivKey,
      //   },
      //   { 
      //     key: 'currentStatus', 
      //     value: status 
      //   },
      // ]
    )
  }

  handleGetCompleteBookingsForAdmin = async(start) => {
    return await this.getBookingsAndFilterParams(
      [
        'currentStatus = "Complete"'
      ],
      start, 20,
      // [
      //   { key: 'currentStatus', value: 'Complete' }
      // ]
    )
  }

  handleGetAllCustomStatusBookings = async() => {
    return await this.getBookingsAndFilterParams(
      [
        'currentStatus != "Draft"',
        'currentStatus != "Live"',
        'currentStatus != "Complete"'
      ],
      0, 2000,
      // [
      //   {
      //     key: 'bms_booking.bookings.bookingDivKey',
      //     value: this.state.bookingDivKey,
      //   },
      //   {
      //     key: 'currentStatus',
      //     value: 'Draft',
      //     exclude: true,
      //   },
      //   {
      //     key: 'currentStatus',
      //     value: 'Live',
      //     exclude: true,
      //   },
      //   {
      //     key: 'currentStatus',
      //     value: 'Complete',
      //     exclude: true,
      //   },
      // ]
    )
  }

  handleLoadMoreOfAllBookings = async() => {
    // NO LONGER IN USE
    // let stateCopy = { ...this.state }
    // stateCopy.tabLoading.All = true
    // this.setState(stateCopy)

    // stateCopy = { ...this.state }

    // let loadedBookings = await await this.getBookingsAndFilterParams(
    //   [
    //     `currentStatus != "Complete"`
    //   ],
    //   this.state.loadFrom.All, 20,
    //   // [
    //   //   { key: 'currentStatus', value: 'Complete', exclude: true }
    //   // ]
    // )

    // if(loadedBookings.length > 0) {
    //   stateCopy.bookings.push(...loadedBookings)
    //   stateCopy.loadFrom.All += loadedBookings.length
    // }
    // stateCopy.tabLoading.All = false
    // stateCopy.currentTab = 'All'
    // this.setState(stateCopy)
  }

  handleLoadMoreAdminCompleteBookings = async() => {
    // The Complete tab loads on first selection but we don't want this behaviour if
    // it already has bookings loaded...
    if (
      this.state.currentTab !== 'Complete' && 
      this.state.loadedCompletedBookings
    ) {
      this.setState({ currentTab: 'Complete' })
      return
    }

    let stateCopy = { ...this.state }
    stateCopy.tabLoading.Complete = true
    this.setState(stateCopy)

    stateCopy = { ...this.state }

    let loadedBookings = await this.handleGetCompleteBookingsForAdmin(this.state.loadFrom.Complete)
    if(loadedBookings.length > 0) {
      stateCopy.bookings.push(...loadedBookings)
      stateCopy.loadFrom.Complete += loadedBookings.length
    }
    stateCopy.tabLoading.Complete = false
    stateCopy.currentTab = 'Complete'
    stateCopy.loadedCompletedBookings = true
    this.setState(stateCopy)
  }

  handleLoadMoreBookingsByStatus = async(status) => {
    // The Complete tab loads on first selection but we don't want this behaviour if
    // it already has bookings loaded...
    if (
      status === 'Complete' &&
      this.state.currentTab !== 'Complete' && 
      this.state.loadedCompletedBookings
    ) {
      this.setState({ currentTab: 'Complete' })
      return
    }
    
    let stateCopy = { ...this.state }
    stateCopy.tabLoading[status] = true
    this.setState(stateCopy)

    stateCopy = { ...this.state }

    let loadedBookings = await this.handleGetBookingsByStatus(this.state.loadFrom[status], status, this.state.bookingDivKey)

    if(loadedBookings.length > 0) {
      stateCopy.bookings.push(...loadedBookings)
      stateCopy.loadFrom[status] += loadedBookings.length
    }

    stateCopy.tabLoading[status] = false
    stateCopy.currentTab = status
    if(status === 'Complete') stateCopy.loadedCompletedBookings = true
    this.setState(stateCopy)
  }

  // █▀▀▄ █░░█ █░░ █░█   █▀▀ █▀▀▄ ░▀░ ▀▀█▀▀
  // █▀▀▄ █░░█ █░░ █▀▄   █▀▀ █░░█ ▀█▀ ░░█░░
  // ▀▀▀░ ░▀▀▀ ▀▀▀ ▀░▀   ▀▀▀ ▀▀▀░ ▀▀▀ ░░▀░░

  rowSelection = () => {
    return {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        if(selectedRowKeys.length === 0) {
          this.clearBulkEdit()
          return
        }
        this.setState({selectedRowKeys})
      },
      getCheckboxProps: booking => (
        {
          disabled: ((booking || {}).flags || []).includes('queried') ||
          ((booking.assignedUserKey || '').length > 0 && this.state.currentTab === 'Live')
        }
      )
    }
  }

  clearBulkEdit = () => {
    this.setState({
      selectedRowKeys: [],
      saveBulkEnabled: false,
    })
  }

  handleSaveBulkComment = async(comment, notify) => {
    let selectedRowKeys = this.state.selectedRowKeys
    let createdUserKey = this.props.user.userKey

    for await(let bookingsKey of selectedRowKeys) {

      let result = await this.actions.createComment({ bookingsKey, comment, createdUserKey }, this.props.bookingDivKey)
  
      if(result.affectedRows > 0 || result.changedRows > 0 ) {
        // Good
      } else {
        console.log('result : ', result)
        message.error('There was a problem saving these changes please check in with the Bigg Dev Team or try again later.', 5)
      }
    }

    // Close the drawer.
    await this.setState({selectedRowKeys: []})

    message.success('Comments saved')
    await this.silentReload()
    return
  }

  proceedBookings = async(booking, selectedRowKeys) => {

    let result = await this.actions.proceedBookings(
      booking,
      selectedRowKeys,
      this.props.bookingDivKey
    )

    await this.clearBulkEdit()
    // await this.loadDataAndSetState()
    await this.silentReload()

    if((result || {}).changedRows === 0 && (result || {}).affectedRows > 0) {
      message.warn('No changes saved. Are you sure the selected bookings have the appropriate templates?', 5)
    } else if((result || {}).changedRows > 0 || (result || {}).affectedRows > 0) {
      message.success('Saved!')
    } else {
      message.error('there was a problem saving these changes please check in with the Bigg Dev Team or try again later.', 5)
    }
  }

  handleProceedValidation = (rolesCurrentlyAllowedToAffect) => {
    return rolesCurrentlyAllowedToAffect.includes(this.props.user.accessLevel)
  }

  handleBulkProceed = async(jsonStatus, nextStatus) => {
    const { selectedRowKeys } = this.state
    const or = selectedRowKeys.map(bookingsKey => (`bookingsKey = "${bookingsKey}"`)).join(' OR ')

    let completedDate
    if(nextStatus === 'Complete') {
      completedDate = moment().toDate()
    }

    if(this.state.currentTab === 'Live') {

      const bookings = await this.actions.getBookingsSmall(or)

      if(bookings.findIndex(booking => (booking.assignedUserKey || '').length > 0) !== -1) {
        message.warn('One or more of the selected bookings already have an assigned user. Reloading the bookings table...')
        await this.silentReload()
        // await this.loadDataAndSetState()
        this.setState({selectedRowKeys: []})
        message.success('Table updated.')
        return
      }

      this.proceedBookings({
        completedDate,
        assignedUserKey: this.props.user.userKey,
        jsonStatus: JSON.stringify(jsonStatus),
        currentStatus: nextStatus
      }, selectedRowKeys, this.props.bookingDivKey)

    } else {
      this.proceedBookings({
        completedDate,
        jsonStatus: JSON.stringify(jsonStatus),
        currentStatus: nextStatus
      }, selectedRowKeys, this.props.bookingDivKey)
    }
  }

  handleSavebulk = async bulkFields => {
    let booking = {}
    const { selectedRowKeys } = this.state

    // If the clearFlags option is true set the flags value
    // whatever it is to 'NULL'
    if(bulkFields.clearFlags) {
      bulkFields.flags = 'NULL'
    }

    Object.keys(bulkFields).filter(key => (

      (bulkFields[key] || []).length > 0  || 
      typeof bulkFields[key] === 'number' || 
      (key === 'dueDate' && bulkFields.dueDate != null)

    )).forEach(key => {

      if(key === 'bookingMonth') {
        booking["$jsonForm[?Booking Month].value"] = bulkFields[key]
        return
      }
      if(key === 'strategy') {
        booking["$jsonForm[?Strategy].value"] = bulkFields[key]
        return
      }
      if(key === 'biggSpend') {
        booking["$jsonForm[?Bigg Spend].value"] = bulkFields[key]
        return
      }
      if(key === 'dueDate') {
        booking[key] = moment(bulkFields[key]).format('YYYY-MM-DD hh:mm:ss')
        return
      }

      if(key === 'flags') {
        // If the flags value is NULL then leave it, otherwise stringify the array.
        if(bulkFields.flags !== 'NULL') booking[key] = JSON.stringify(bulkFields[key])
        else booking[key] = bulkFields[key]
        return
      }

      booking[key] = bulkFields[key]
      return

    })

    const hideMessage = message.loading('Saving changes...', 0)

    let result = await this.actions.updateBookings(booking, selectedRowKeys, this.props.bookingDivKey)

    await this.clearBulkEdit()
    await this.silentReload()

    if(result.changedRows === 0 && result.affectedRows > 0) {
      message.warn('No changes saved. Are you sure the selected bookings have the appropriate templates?', 5)
    } else if (result.changedRows !== result.affectedRows){
      message.warn('Some of your changes didn\'t save. Are you sure the selected bookings have the appropriate templates?', 5)
    } else if(result.changedRows > 0) {
      message.success('Saved!')
    } else {
      message.error('there was a problem saving these changes please check in with the Bigg Dev Team or try again later.', 5)
    }
    hideMessage()
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderFilterTab = (columns, bookings) => {
    return (
      (this.state.jsonFilterSelectedCount > 0 || this.state.filterLoading) &&
      <Tabs.TabPane
        key={'Filter'}
        tab={
          <span>
            {
              this.state.filterLoading ?
              <div>
                Filter 
                <Icon
                  style={{
                    position: 'absolute', 
                    right: -11,
                    top: 5
                  }}
                  type="loading" 
                />
              </div>
              :
              <Badge
                overflowCount={9999}
                count={(this.state.bookingsFiltered || []).length}
                offset={this.badgeOffset('Filter')}
                style={{
                  backgroundColor: colorPicker('status', 'value', 'Default').color
                }}
              >Filter 
              </Badge>
            }
          </span>
        }
      >
        <Table
          loading={this.state.bookingsTableLoading}
          rowKey="bookingsKey"
          rowSelection={
            this.state.rowSelection ?
              this.rowSelection()
              :
              null
          }
          size="small"
          pagination={{
            size: 'small',
            showSizeChanger: true,
            position: 'both',
          }}
          columns={columns}
          dataSource={this.state.bookingsFiltered}
        ></Table>
      </Tabs.TabPane>
    )
  }

  renderSearchTab = (columns, bookings) => {
    return (
      this.state.searchTab &&
      <Tabs.TabPane
        key={'Search'}
        tab={
          <span>
            {
              this.state.searchLoading ?
              <div>
                Search 
                <Icon
                  style={{
                    position: 'absolute', 
                    right: -11,
                    top: 5
                  }}
                  type="loading" 
                />

              </div>
              :
              <Badge
                overflowCount={9999}
                count={(this.state.bookingsSearched || []).length}
                offset={this.badgeOffset('Search')}
                style={{
                  backgroundColor: colorPicker('status', 'value', 'Default').color
                }}
              >Search 
              </Badge>
            }
          </span>
        }
      >
        <Table 
          loading={this.state.bookingsTableLoading}
          rowSelection={
            this.state.rowSelection ? 
            this.rowSelection()
              :
              null
          }
          size="small"
          pagination={false}
          columns={columns}
          rowKey="bookingsKey"
          dataSource={this.state.bookingsSearched}
        ></Table>
      </Tabs.TabPane>
    )
  }

  renderProviderAndAdminTabs = (jsonStatus, bookings, division, columns) => (
    jsonStatus.map((status, index) => (
      <Tabs.TabPane
        key={status.value}
        tab={
          <span>
            <Icon type={colorPicker('status', 'value', status.value).icon} />
            <Badge
              overflowCount={9999}
              onClick={() => this.handleClickBadge(status.value, this.handleLoadMoreBookingsByStatus)}
              count={this.renderCountIcon(bookings, status.value, division)}
              offset={this.badgeOffset(status.value)}
              style={
                status.value !== 'Complete' ||
                  (status.value === 'Complete' && this.state.loadedCompletedBookings) ?
                  {
                    backgroundColor: colorPicker('status', 'value', status.value).color
                  }
                  :
                  null
              }
            >
              {status.value}
            </Badge>
          </span>
        }
      >
        <Table 
          loading={this.state.bookingsTableLoading}
          rowSelection={
            this.state.rowSelection ? 
            this.rowSelection()
              :
              null
          }
          size="small"
          rowKey="bookingsKey"
          pagination={false}
          columns={this.filterColumnsByTab(columns)}
          dataSource={this.filterBookingsByTab(bookings, status.value)}
        >
        </Table>
        {
          this.renderLoadMoreLink(status.value, this.handleLoadMoreBookingsByStatus)
        }
      </Tabs.TabPane>
    ))
  )

  renderSupplierAndSupplierAdminTabs = (jsonStatus, bookings, division, columns) => (
    jsonStatus.map((status, index) => (
      status.value !== 'Draft' &&
      <Tabs.TabPane
        key={status.value}
        tab={
          <span>
            <Icon type={colorPicker('status', 'value', status.value).icon} />
            <Badge
              overflowCount={9999}
              onClick={() => this.handleClickBadge(status.value, this.handleLoadMoreBookingsByStatus)}
              count={this.renderCountIcon(bookings, status.value, division)}
              offset={this.badgeOffset(status.value)}
              style={
                status.value !== 'Complete' ||
                  (status.value === 'Complete' && this.state.loadedCompletedBookings) ?
                  {
                    backgroundColor: colorPicker('status', 'value', status.value).color
                  }
                  :
                  null
              }
            >
              {status.value}
            </Badge>
          </span>
        }
      >
        <Table 
          rowKey="bookingsKey"
          rowSelection={
            this.state.rowSelection ? 
            this.rowSelection()
              :
              null
          }
          size="small"
          pagination={false}
          columns={this.filterColumnsByTab(columns)}
          dataSource={this.filterBookingsByTab(bookings, status.value)}
        ></Table>
        {
          this.renderLoadMoreLink(status.value, this.handleLoadMoreBookingsByStatus)
        }
      </Tabs.TabPane>
    ))
  )

  renderCountIcon = (bookings, tab, division) => (
    this.state.tabLoading[tab] ?
      <Icon type="loading" style={{
        borderRadius: '50%',
        background: 'white',
      }} />
      :
      this.state.loadedCompletedBookings || tab !== 'Complete' ?
        tab === 'Live' || tab === 'Draft' || tab === 'Complete' || tab === 'All' ?
        <span style={{
          padding: 2,
          paddingLeft: 10,
          display: 'flex',
          borderRadius: 9,
          color: 'white'
          }}>
            {(this.filterBookingsByTab(bookings, tab)).length}
          <Icon type="cloud-download" style={{ color: 'white', fontSize: 10 }} />
        </span>
        :
        (this.filterBookingsByTab(bookings, tab)).length
      :
      <Icon type="cloud-download" style={{ color: '#d9d9d9' }} />
  )

  renderLoadMoreLink = (tab, loadMoreFunction) => (
    (
      tab === 'Complete' ||
      tab === 'Live'     ||
      tab === 'Draft'    ||
      tab === 'All'
    ) &&
    <div className="load-button" ref={input => this.inputElement = input}
      onClick={() => loadMoreFunction(tab)}
      style={{
        textDecoration: 'underline',
        cursor: 'pointer',
        color: '#2BAAE0',
        textAlign: 'center',
        fontSize: 16,
        paddingTop: 16
      }}
    >
      {
        this.state.tabLoading[tab] ?
          <Icon type="loading" />
          :
          'Load More'
      }
    </div>
  )

  renderSelectedDivisionTables = (columns) => {
    let { jsonStatus, bookings, division } = this.state
    let { accessLevel } = this.props.user
    return (
      <Tabs
        activeKey={this.state.currentTab}
        onChange={key => {
          if (key === 'Complete') {
            this.handleLoadMoreBookingsByStatus('Complete')
          } else {
            this.setState({ currentTab: key })
          }
        }}
      >
        {
          accessLevel === 'Provider Admin' || accessLevel === 'Provider' || accessLevel === 'Admin' ?
          this.renderProviderAndAdminTabs(jsonStatus, bookings, division, columns)
          :
          (accessLevel === 'Supplier' || accessLevel === 'Supplier Admin') &&
          this.renderSupplierAndSupplierAdminTabs(jsonStatus, bookings, division, columns)
        }
        {
          this.renderFilterTab(columns, bookings)
        }
        {
          this.renderSearchTab(columns, bookings)
        }
      </Tabs>
    )
  }

  tasksStatus = ( fillColor, iconStyle, icon, description ) => {
    return (
      <div style={{
        position: 'relative'
      }}>
          <svg style={{
            display: 'block',
            margin: '10px auto',
            width: '30px',
            height: '30px'
          }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle fill={ fillColor } cx="50" cy="50" r="35"/>
          </svg>
          <Tooltip placement="top" title={ description }>
            <Icon style={ iconStyle } type={ icon } />
          </Tooltip>
      </div>
    )
  }

  taskIncomplete = ( fillColor, daysRemaining, percentage ) => {
    return (
      <Tooltip placement="top" title={`${ typeof daysRemaining === 'number' ? daysRemaining : 'unknown' } days remaining`}>
        <svg style={{
          display: 'block',
          margin: '10px auto', 
          width: '20px',
          height: '20px'
        }} viewBox="0 0 16 16" stroke={ fillColor } className="circular-chart">
          <path style={{
            fill: 'none',
            stroke: '#eeeeee',
            strokeWidth: '2.9'
          }} className="circle-bg"
            d="M8 1
              a 7 7 0 0 1 0 14
              a 7 7 0 0 1 0 -14"
          />
          <path style={{
            fill: 'none',
            strokeLinecap: 'round'
          }} className="circle"
            strokeWidth="1.9"
            strokeDasharray={ `${ percentage }, 44` } 
            d="M8 1
              a 7 7 0 0 1 0 14
              a 7 7 0 0 1 0 -14"
          />
        </svg>
      </Tooltip>
    )
  }

  renderTotalValue = (dataIndex, bookings) => {
    if(!bookings || bookings.length === 0) return 0
    return bookings.reduce((num, booking) => {
      if(booking[dataIndex]) {
        return num + Number(booking[dataIndex])
      }
      return num
    }, 0).toFixed(2)
  }

  renderCustomFilter = () => {
    const { 
      jsonFilter, 
      jsonFilterSelectedCount,
    } = this.state
    const gridStyle = optionItem => (
      {
        width: '100%',
        height: 29,
        fontSize: 13,
        padding: '0px 0px 2px 5px',
        cursor: 'default',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        color: optionItem.selected && 'white',
        backgroundColor: optionItem.selected && '#0dc48a',
        pointerEvents: this.state.disableFilterOptions ? 'none' : 'auto',
      }
    )
    const filterTitleStyles = {
      marginTop: 16,
      marginBottom: 6,
      fontSize: '80%',
    }
    return (
      <div
        style={{
          position: 'relative'
        }}
      >
        <Card
          width={620}
          style={{
            marginBottom: 16,
            position: 'relative',
            height: this.state.hideFilter ? 150 : 511,
            overflow: 'hidden',
          }}
        >
          <Row gutter={16}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Col span={3}>
              <h3
                style={{color: '#2baae0'}}
              >
                Custom Filter
                <div
                  style={{
                    position: 'absolute',
                    top: -30,
                    right: 30
                  }}
                >
                  {
                    this.state.filterLoading ?
                    <Icon type="loading" style={{ marginLeft: 16 }} />
                    :
                    this.state.jsonFilterSelectedCount > 0 &&
                    <Badge
                      overflowCount={9999}
                      count={(this.state.bookingsFiltered || []).length}
                      style={{ backgroundColor: '#2baae0' }}
                    >
                    </Badge>
                  }
                </div>
              </h3>
            </Col>
            <Col span={3}>
              <Form.Item
                label="Max Bookings"
              >
                <InputNumber
                  size="small"
                  onKeyUp={this.onKeyUpEnterFilter}
                  value={this.state.maxFilterBookings}
                  onChange={this.onChangeMaxBookings}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                label="Sort By"
                style={{
                  paddingRight: '35%',
                  position: 'relative'
                }}
              >
                <Button
                  shape="circle"
                  size="small"
                  icon={this.state.ascOrDesc === 'desc' ? 'sort-descending' : 'sort-ascending'}
                  style={{ 
                    position: 'absolute',
                    top: -9,
                    right: -34,
                    border: 'none',
                    zIndex: 1,
                    color: '#2baae0', 
                  }}
                  onClick={this.handleSortDirection}
                />
                <Select
                  size="small"
                  style={{ width: '100%' }}
                  value={this.state.sortBy}
                  onChange={this.handleSortSelection}
                >
                  <Select.Option value="bookingName">Booking Name</Select.Option>
                  <Select.Option value="tmpName">Template Name</Select.Option>
                  <Select.Option value="currentStatus">Status</Select.Option>
                  <Select.Option value="strategy">Strategy</Select.Option>
                  <Select.Option value="bookingMonth">Booking Month</Select.Option>
                  <Select.Option value="partnerName">Partner Name</Select.Option>
                  <Select.Option value="customerName">Customer Name</Select.Option>
                  <Select.Option value="units">Units</Select.Option>
                  <Select.Option value="created">Created Date</Select.Option>
                  <Select.Option value="createdByFullName">Created By</Select.Option>
                  <Select.Option value="assignedFullName">Assigned To</Select.Option>
                  <Select.Option value="dueDate">Due Date</Select.Option>
                  <Select.Option value="completedDate">Completed Date</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <div
              style={{
                height: 70,
                border: '.5px solid #d4d4d4',
                position: 'relative',
                right: 1,
                bottom: 9,

              }}
            />
            <Col span={12}>
              <Row
                style={{
                  display: 'flex', 
                  justifyContent: 'space-around',
                  position: 'relative',
                }}
              >
                <Col span={5}>
                  <Form.Item label="Created Date">
                    <RangePicker
                      placeholder={['Start', 'End']}
                      size="small"
                      onChange={moments => {
                        this.selectFilterDateRange('created', moments)
                      }}
                      value={
                        this.state.createdFilterDates.length === 2 &&
                        [moment(this.state.createdFilterDates[0]), moment(this.state.createdFilterDates[1])]
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item label="Due Date">
                    <RangePicker
                      placeholder={['Start', 'End']}
                      size="small"
                      onChange={moments => {
                        this.selectFilterDateRange('dueDate', moments)
                      }}
                      value={
                        this.state.dueFilterDates.length === 2 &&
                        [moment(this.state.dueFilterDates[0]), moment(this.state.dueFilterDates[1])]
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item label="Completed Date">
                    <RangePicker
                      placeholder={['Start', 'End']}
                      size="small"
                      onChange={moments => {
                        this.selectFilterDateRange('completedDate', moments)
                      }}
                      value={
                        this.state.completedFilterDates.length === 2 &&
                        [moment(this.state.completedFilterDates[0]), moment(this.state.completedFilterDates[1])]
                      }
                    />
                  </Form.Item>
                </Col>
                <div
                  style={{ 
                    position: 'absolute',
                    width: '100%',
                    top: -10,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      display: 'flex',
                      right: 0,
                      alignItems: 'center'
                    }}
                  >
                      <Dropdown
                        placement="bottomRight"
                        overlay={
                          <Menu style={{
                            minWidth: 160,
                          }}>
                            <Menu.Item
                              onClick={this.handleShowSavedStateDrawer}
                              style={{
                                borderBottom: '1px solid #d9d9d9',
                                position: 'relative',
                              }}
                            >
                              Save Custom Filter 
                              <Icon
                                type="right"
                                style={{
                                  position: 'absolute',
                                  right: 10,
                                  top: 10,
                                  fontSize: 10,
                                }}
                              />
                            </Menu.Item>
                            {
                              this.state.bookingStateRecords.map(bookingState => (
                                <Menu.Item
                                  key={bookingState.bookingStateKey}
                                  onClick={() => {
                                    this.handleSelectBookingState(bookingState.jsonState)
                                  }}
                                >
                                  {bookingState.bookingStateName}
                                </Menu.Item>
                              ))
                            }
                          </Menu>
                        }
                      >
                        <div 
                          style={{
                            cursor: 'pointer',
                            marginTop: 16,
                            textAlign: 'right',
                            color: '#2baae0',
                            position: 'absolute',
                            right: 0,
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          Filters <Icon type="down" />
                        </div>
                      </Dropdown>
                    <Drawer
                      title="Choose or Save Filter Selections"
                      width={620}
                      onClose={this.handleHideSavedStateDrawer}
                      visible={this.state.showSavedStateDrawer}
                    >
                      {
                        this.state.showSavedStateDrawer ?
                        <Input
                          style={{marginBottom: 15}}
                          onPressEnter={this.handleAddStateRecord}
                          placeholder="Save Current Filter State as..."
                          onChange={this.handleBookingStateName}
                          suffix={<Icon
                            onClick={this.handleAddStateRecord}
                            type="plus" 
                          />}
                        />
                        :
                        <Input 
                          style={{marginBottom: 15}}
                          placeholder="Save Current Filter State as..."
                          suffix={<Icon
                            type="plus" 
                          />}
                        />
                      }
                      {
                        this.state.bookingStateRecords.length > 0 &&
                        this.state.bookingStateRecords.map((bookingState,i) => (
                          <Row
                            key={bookingState.bookingStateKey}
                            style={{
                              paddingTop: 15,
                            }}
                          >
                            <Col 
                              span={14}
                              style={{ 
                                fontWeight: 600,
                                marginBottom: 6
                              }}
                            >
                              <Button
                                type="link"
                                href="#"
                                onClick={e => {
                                  e.preventDefault()
                                  this.handleSelectBookingState(bookingState.jsonState)
                                }}
                              >
                                {bookingState.bookingStateName}
                              </Button>
                              <span style={{ position: 'absolute', right: 0 }}>
                                <Icon 
                                  onClick={i => this.handleDeleteStateRecord(bookingState.bookingStateKey, i)} 
                                  style={{ fontSize: 20, cursor: 'pointer' }} 
                                  type="minus-circle" 
                                />
                              </span>
                            </Col>
                          </Row>

                        ))
                      }
                    </Drawer>
                  </div>

                </div>
              </Row>
            </Col>
          </Row>
          <div className="bms--filter-options-row">
            <div className="bms--filter-options-wrapper">
              {
                jsonFilter && jsonFilter
                .filter(item => item.options.length > 1 && item.options[0] !== 'null')
                .map((item, itemIndex) => (
                  item.type !== 'date' && item.options.length > 0 &&
                  <div 
                    key={itemIndex} 
                    className="bms--filter-options"
                  >
                    <div style={filterTitleStyles}><strong>{item.prettyName}</strong></div>
                    <div className="filter-wrapper" style={{ height: 230, overflowY: 'scroll' }}>
                      {
                        item.options
                          .sort((a, b) => this.filterSorting(a.option, b.option, item))
                          .filter(optionItem => optionItem.option !== 'null')
                          .map((optionItem, filtIndex) => { 
                            return <Card.Grid
                              onClick={() => this.selectFilterOption(item.dataIndex, optionItem.option, item.type)}
                              key={filtIndex}
                              style={{
                                ...gridStyle(optionItem),
                              }}
                            >
                              <Tooltip
                                placement="left"
                                title={
                                  (optionItem.option || '').length > 16 ? 
                                  item.type=== 'json' ?
                                  <div style={{
                                    display: 'flex',
                                  }}>
                                    {
                                      JSON.parse(optionItem.option).map((flag, i) => (
                                        this.renderFlag(flag, i)
                                      ))
                                    }
                                  </div>
                                  :
                                  optionItem.option 
                                  : 
                                  null
                                }
                              >
                                <small
                                  style={{
                                    color: 
                                    optionItem.selected ? 'white' : this.state.disableFilterOptions ? 
                                    '#a9a9a9' 
                                    : 
                                    'unset'
                                  }}
                                >
                                  {
                                    item.type === 'json' ?
                                    <div style={{
                                      display: 'flex',
                                      marginBottom: 4,
                                    }}>
                                      {
                                        optionItem.option !== 'null' &&
                                        JSON.parse(optionItem.option).map((flag, i) => (
                                          this.renderFlag(flag, i)
                                        ))
                                      }
                                    </div>
                                    :
                                    optionItem.option
                                  }
                                </small>
                                <span
                                  style={{
                                    position: 'absolute',
                                    fontSize: 9,
                                    top: 4,
                                    right: 0,
                                    paddingRight: 7,
                                    paddingLeft: 7,
                                    color: optionItem.selected ? 'white' : '#adadad',
                                  }}
                                >{
                                    optionItem.count
                                }</span>
                            </Tooltip>
                          </Card.Grid>
                        })
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          {
            jsonFilterSelectedCount > 0 && !this.state.disableFilterOptions &&
            <Row>
              <div
                onClick={() => this.clearFilterOptions()}
                style={{
                  cursor: 'pointer',
                  marginTop: 16,
                  textAlign: 'right',
                  color: '#2baae0',
                  textDecoration: 'underline',
                  position: 'absolute',
                  right: 0,
                  zIndex: 1
                }}
              >Clear</div>
            </Row>
          }
        </Card>
        <Row
          style={{
            position: 'absolute',
            bottom: 10,
            width: '100%',
          }}
        >
          <Col
            span={24}
            style={{ textAlign: 'center' }}
          >
            {
              this.state.hideFilter ?
                <Icon 
                  style={{color: '#d4d4d4', fontSize: 20}}
                  onClick={() => this.handleHideFilter(false)}
                  type="down"
                />
                :
                <Icon 
                  style={{color: '#d4d4d4', fontSize: 20}}
                  onClick={() => this.handleHideFilter(true)}
                  type="up"
                />
            }
          </Col>
        </Row>
      </div>
    )
  }

  handleCloseBookingTabDrawer = () => {
    this.setState({
      handlers: null,
      currentBooking: {},
      bookingTabDrawerVisible: false
    })
  }
  
  handleOpenBookingTabDrawer = (booking) => {
    const handlers = new Handlers(booking, this.props.user, this.silentReload)
    const currentBooking = booking
    this.setState({bookingTabDrawerVisible: true, handlers, currentBooking})
  }

  handleCreateComment = async (comment) => {
    let result = await this.state.handlers.createComment(comment, this.props.bookingDivKey)
    this.updateRenderedBookings('commentCount')
    return result
  }
  
  handleCreateUpload = async (upload) => {
    let result = await this.state.handlers.createUpload(upload, this.props.bookingDivKey)
    this.updateRenderedBookings('uploadsCount')
    return result
  }

  renderFlag = (flag,i) => (
    <div
      key={i}
      style={{
        backgroundColor: this.flagColor(flag),
        color: 'white',
        padding: '0 4px',
        borderRadius: 5,
        fontSize: 10,
        minWidth: 44,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        marginLeft: 2,
        boxShadow: 'rgba(0, 0, 0, 0.19) 1px 1px 3px 0px',
      }}
    >{flag}</div>
  )

  flagColor = flag => {
    if(!flag) return

    const {division} = this.state

    let color = (colorPicker('template', 'colorLabel', (division.jsonFlags.find(
      flagObj => flagObj.value === flag
    ) || {}).colorLabel) || {}).color

    if(!color || color.length === 0) {
      return '#969696'
    }

    return color
  }

  render() {

    // █▀▀ █▀▀█ █░░ █░░█ █▀▄▀█ █▀▀▄ █▀▀
    // █░░ █░░█ █░░ █░░█ █░▀░█ █░░█ ▀▀█
    // ▀▀▀ ▀▀▀▀ ▀▀▀ ░▀▀▀ ▀░░░▀ ▀░░▀ ▀▀▀

    const columns = [
      {
        title: 'Booking Name',
        dataIndex: 'bookingName',
        key: 'bookingName',
        className: 'bms--has-icons',
        render: (text, record) => (
          <div>
            <Link
              to={this.props.viewBookingRoute + '/' + record.bookingsKey}
            >
              {decodeURIComponent(text)}
            </Link>
            <div style={{
              position: 'absolute',
              right: 2,
              top: 4,
              height: 16,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              {
                (record.flags || []).length > 0 &&
                  record.flags.map((flag, i) => (
                    this.renderFlag(flag, i)
                  ))
              }
              {
                <Tooltip
                  title={record.uploadsCount > 0 ? record.uploadsCount : 'None'}
                >
                  <Icon
                    onClick={() => this.handleOpenBookingTabDrawer(record)}
                    className={record.uploadsCount > 0 ? 'bms--icon-alive' : 'bms--icon-dead'}
                    type="paper-clip"
                  />
                </Tooltip>
              }
              {
                <Tooltip
                  title={record.commentCount > 0 ? record.commentCount : 'None'}
                >
                  <Icon
                    onClick={() => this.handleOpenBookingTabDrawer(record)}
                    className={record.commentCount > 0 ? 'bms--icon-alive' : 'bms--icon-dead'}
                    type="message"
                  />
                </Tooltip>
              }
            </div>
          </div>
        )
      },
      {
        title: 'Template Name',
        dataIndex: 'tmpName',
        key: 'tmpName',
        className: 'bms--has-tmp-name-tag',
        render: (text, record) => {
          let bookingColor = record.colorLabel ? (colorPicker('template', 'colorLabel', record.colorLabel) || {}).color : null
          return (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: bookingColor, position: 'absolute', bottom: '0', top: '0', left: '0', right: '0' }}>
              <p style={{ padding: '16px', lineHeight: '1em', marginBottom: '0', color: '#ffffff' }}>
                {decodeURIComponent(text || '')}
              </p>
            </div>
          )
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          let status = record.currentStatus
          return this.formatDataByKey('status', status)
        }
      },
      {
        title: 'Strategy',
        dataIndex: 'strategy',
        key: 'strategy',
        className: 'bms--has-tmp-name-tag',
        render: (text, record) => {
          let bookingColor = record.strategy ? colorPicker('strategy', 'value', record.strategy).color : ''
          return (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: bookingColor, position: 'absolute', bottom: '0', top: '0', left: '0', right: '0' }}>
              <p style={{ padding: '16px', lineHeight: '1em', marginBottom: '0', color: '#ffffff' }}>
                {decodeURIComponent(text || '')}
              </p>
            </div>
          )
        }
      },
      {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
        style: { background: 'red' },
        render: (text, record, i) => {
          // Dates and times...
          const now = moment().startOf('day')
          const dueDate = moment( record.dueDate ).startOf( 'day' )

          // Math stuff...
          const daysRemaining = dueDate.diff( now, 'days'  )
          const dueIn =  dueDate.diff( now, 'days'  )
          const daysRemainingPercentage = (8 - daysRemaining) * 5.5
          const dueDateFormat = dueDate.format( 'Do MMM' )

          // color...
          const red = '#f5222d'
          const green = '#52c41a'
          const blue = '#09a9dd'
      
          // Consistent style for icon...
          const iconStyle = {
            position: 'absolute',
            top: 0,
            zIndex: 1,
            bottom: 0,
            margin: 'auto',
            right: 0,
            color: '#ffffff',
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px' 
          }
          
          if ( record.currentStatus === 'Complete' ) { 
            return (
              <Fragment>
                <div style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'
                }}>
                  { this.tasksStatus( green, iconStyle, 'like', `Complete` ) }
                  <span>
                    &nbsp;{ dueDateFormat }
                  </span>
                </div>
              </Fragment>
            )
          } else {
            if ( dueIn > 0 && daysRemaining < 8 ) {
              return (
                <Fragment>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '80px',
                    whiteSpace: 'nowrap'
                  }}>
                    { this.taskIncomplete( blue, daysRemaining, daysRemainingPercentage ) }
                    <span>
                    &nbsp;{ dueDateFormat } 
                    </span>
                  </div>
                </Fragment>
              )

            } else if ( dueIn >= 0 && dueIn <= 1 ) {
              return (
                <Fragment>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '80px',
                    whiteSpace: 'nowrap'
                  }}>
                    { this.tasksStatus( red, iconStyle, 'warning', `Due today!` ) }
                    <span>
                    &nbsp;{ dueDateFormat }
                    </span>
                  </div>
                </Fragment>
              )
            } else if ( daysRemaining >= 8 ) {
              return (
              <Fragment>
                <div style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px',
                  whiteSpace: 'nowrap'

                }}>
                  

                    { dueDateFormat }

                  </div>
                </Fragment>
                )
            } else {
              return (
                <Fragment>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '80px',
                    whiteSpace: 'nowrap'
                  }}>
                    { this.tasksStatus( red, iconStyle, 'dislike', `Overdue by ${ Math.abs( daysRemaining ) } days` ) }
                    <span>
                    &nbsp;{ dueDateFormat }
                    </span>
                  </div>
                </Fragment>
              )
            }
          }
        }
      },
      {
        title:
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {
              this.handleTotalValue('biggSpend') > 0 &&
              <span
                style={{
                  width: 240,
                  position: 'absolute',
                  textAlign: 'center',
                  top: -14,
                  zIndex: 1,
                }}
              >
                <Tag
                  color="#0000008c"
                  style={{
                    fontSize: 11,
                  }}
                >
                  Total Spend £{this.handleTotalValue('biggSpend')}
                </Tag>
              </span>
            }
            Bigg Spend
      </div>,
        dataIndex: 'biggSpend',
        key: 'biggSpend',
        render: val => <div>£{val}</div>
      },
      {
        title: 'Partner Name',
        dataIndex: 'partnerName',
        // width: 130,
        key: 'partnerName',
        className: 'bms--has-tmp-name-tag',
        // sorter: (a, b) => this.sortByNumberOrAlpha(a, b, 'partnerName', 'string'),
        render: (text, record) => {
          let bookingColor = record.partnerName ? colorPicker('partner', 'value', record.partnerName).color : null
          return (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: bookingColor, position: 'absolute', bottom: '0', top: '0', left: '0', right: '0' }}>
              <p style={{ padding: '16px', lineHeight: '1em', marginBottom: '0', color: '#ffffff' }}>
                {decodeURIComponent(record.partnerName)}
              </p>
            </div>
          )
        }
      },
      {
        title: 'Customer Name',
        dataIndex: 'customerName',
        key: 'customerName',
      },
      {
        title:
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {
              this.handleTotalValue('units') > 0 &&
              <span
                style={{
                  width: 240,
                  position: 'absolute',
                  textAlign: 'center',
                  top: -14,
                  zIndex: 1,
                }}
              >
                <Tag
                  color="#0000008c"
                  style={{
                    fontSize: 11,
                  }}
                >
                  Total Units {this.handleTotalValue('units')}
                </Tag>
              </span>
            }
              Units
          </div>,
        dataIndex: 'units',
        key: 'unit',
      },
      {
        title: 'Campaign Period',
        dataIndex: 'periodKey',
        key: 'periodKey',
      },
      {
        title: 'Created By',
        dataIndex: 'createdByFullName',
        key: 'createdByFullName',
        render: (text, record, i) => (
          record.createdByFullName
        )
      },
      {
        title: 'Booking Month',
        dataIndex: 'bookingMonth',
        key: 'bookingMonth',
      },
      {
        title: 'Created Date',
        dataIndex: 'created',
        key: 'created',
        render: (text, record, i) => (
          moment(record.created).format( 'Do MMM' )
        )
      },
      {
        title: 'Assigned User',
        dataIndex: 'assignedUser',
        key: 'assignedUser',
        render: (text, record, i) => (
          record.assignedUserKey &&
          record.assignedFullName
        )
      },
      {
        title: 'Completed Date', 
        dataIndex: 'completedDate',
        key: 'completedDate',
        render: (text, record, i) => {
          if (record.completedDate) return moment(record.completedDate).format( 'Do MMM' )
        }
      }
    ]

    const { loading } = this.state

    return (
      !loading ?
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <div style={{width: '100%', display: 'flex'}}>
          <Search
            value={this.state.searchTerm}
            onChange={this.onSearchTerm}
            onPressEnter={this.handleOnEnterSearch}
            placeholder="Search all bookings"
            style={{ marginBottom: '24px' }}
            onKeyUp={this.handleApiSearch}
          />
          <InputNumber 
            min={1}
            max={1000}
            style={{width: 70, marginLeft: 10}}
            value={this.state.maxSearchBookings}
            onChange={this.handleChangeMaxSearch}
            onPressEnter={this.handleOnEnterSearch}
          />
        </div>
        {this.renderCustomFilter()}
        <Card>
          {
            <div>
              <Row>
                <Col span={24} style={{ marginBottom: '10px', textAlign: 'right' }}>
                  {
                    (this.props.user.accessLevel !== 'Supplier' && this.props.user.accessLevel !== 'Supplier Admin')  &&
                    <Button
                      type="primary"
                      onClick={this.viewBookingForm}
                    >
                      New Booking...
                    </Button>
                  }
                </Col>
              </Row>
              {
                this.renderSelectedDivisionTables(columns)
              }
            </div>
          }
        </Card>
        {
          this.state.selectedRowKeys.length > 0 && 
          this.state.currentTab !== 'Filter' && 
          this.state.currentTab !== 'Search' &&
          this.state.currentTab !== 'Complete' &&
          <Row
            style={{
              position: 'fixed',
              bottom: 20,
              width: 780,
              zIndex: this.state.bookingTabDrawerVisible ? 1000 : 1001,
              left: '30vw'
            }}
          >
            <Col span={24}>
              <BookingProceed
                onClose={() => this.setState({selectedRowKeys: []})}
                color="white"
                size="small"
                validation={this.handleProceedValidation}
                user={this.props.user}
                currentStatus={this.state.currentTab }
                jsonStatus={this.state.division.jsonStatus || []}
                rolesCurrentlyAllowedToAffect={[
                  'Admin', 
                  'Supplier Admin',
                  'Supplier',
                  (this.state.currentTab === 'Draft' && 'Provider') || (this.state.currentTab === 'Draft' && 'Provider Admin')
                ]}
                buttonType={this.state.currentTab === 'Live' ? 'Assign' : 'Proceed'}
                style={{
                  boxShadow: '5px 10px 20px #888888'
                }}
                update={this.handleBulkProceed}
                loading={false}
              />
            </Col>
          </Row>
        }

        <BulkEditDrawer
          selectedRowKeys={this.state.selectedRowKeys}
          api={this.props.api}
          apiKey={this.props.user.apiKey}
          flags={this.state.division?.jsonFlags?.map(jsonF => jsonF.value)}
          statuses={this.state.division?.jsonStatus?.map(jsonS => jsonS.value)}
          save={this.handleSavebulk}
          createComment={this.handleSaveBulkComment}
          userAccessLevel={this.props.user.accessLevel}
          currentTab={this.state.currentTab}
          onClose={() => this.setState({selectedRowKeys: []})}
          visible={(this.state.selectedRowKeys || []).length > 0}
        >
        </BulkEditDrawer>

        <Drawer
          width={610}
          visible={this.state.bookingTabDrawerVisible}
          onClose={this.handleCloseBookingTabDrawer}
        >
          {
            this.state.currentBooking.bookingName ?
            <div>
              <h2 id="bookings-key">{decodeURIComponent(this.state.currentBooking.bookingName)}</h2>
              <p
                style={{color: '#595959'}} 
              >
                <b>Bookings Key: </b>
                {this.state.currentBooking.bookingsKey} 
                <Icon 
                  onClick={() => this.handleCopyKey(this.state.currentBooking.bookingsKey)} 
                  type="copy"
                  style={{
                    marginLeft: 10,
                    fontSize: 17,
                    color: '#b7b7b7',
                  }}
                />
              </p>
            </div>
            :
            <div></div>
          }
          {
            this.state.handlers &&
            <BookingTabs
              bookingUrl={
                config.notifyBaseUrl + 
                this.props.location.pathname + 
                '/booking/' +
                this.state.currentBooking.bookingsKey
              }
              queryMode={false}
              scrollable={false}
              bordered={false}
              booking={this.state.currentBooking}
              user={this.props.user}
              getUploads={this.state.handlers.getUploads}
              getComments={this.state.handlers.getComments}
              updateBooking={this.state.handlers.updateBooking}
              createComment={async(comment) => await this.handleCreateComment(comment, this.props.bookingDivKey)}
              createUpload={this.handleCreateUpload}
            />
          }
        </Drawer>
        
      </Content>
      :
        <div
          style={{
            position: 'relative',
            color: '#2ba9e0',
            height: '100vh',
            width: '80vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
          }}
        >
          <Icon type="loading" />
        </div>
      )
  }
}
