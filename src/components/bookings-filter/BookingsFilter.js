import React, { Component } from 'react'
import { connect } from 'react-redux'
import { API } from '../../libs/apiMethods'
import axios from 'axios'
import Actions from '../../actions/booking-hub/Actions'
import Helper from '../../actions/booking-hub/Helper'
import Handlers from '../../actions/booking-hub/Handlers'
import config from '../../libs/BigglyConfig'
import { 
  Card, 
  Layout, 
  Icon, 
  Tag, 
  Tooltip, 
  message, 
  Drawer,
} from 'antd'
import moment from 'moment'
import colorPicker from '../../libs/bigglyStatusColorPicker'
import BulkEditDrawer from '../Bookings/BulkEditDrawer.js'
import BookingTabs from '../Bookings/BookingTabs'
import CustomFilterPanel from '../../features/custom-filter-panel/CustomFilterPanel'
import FilteredBookingsTable from './FilteredBookingsTable'

import './BookingsTable.css'
import 'antd/dist/antd.css'

import makeColumns from './BookingsFilter.columns.js'

const CancelToken = axios.CancelToken

const { Content } = Layout

let cancelFilterOption
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

class BookingsFilter extends Component {

  constructor(props) {
    super(props)
    this.helper = new Helper(props.user.apiKey)
    this.actions = new Actions(props.user.apiKey, props.user.userKey)
    this.state = {
      currentTab: 'Filter',
      defaultTab: 'Filter',
      loadCompletedBookingsFrom: 0,
      loadedCompletedBookings: false,
      loadingMoreBookings: false,

      partnerKey: null,

      // filter options...
      bookingsFiltered: [],
      customFilter: true,
      disableFilterOptions: false,
      filterLoading: false,
      hideFilter: false,
      jsonFilter: null,
      jsonFilterSelectedCount: 0,
      maxFilterBookings: 1000,
      maxSearchBookings: 1000,
      sortBy: 'dueDate',

      ascOrDesc: 'asc',
      completedFilterDates: [],
      createdFilterDates: [],
      dueFilterDates: [],

      // These are all the keys from the state
      // that are allowed to be saved to the user's jsonState
      jsonStateKeys: [
        'ascOrDesc',
        'bookingDivKey',
        'completedFilterDates',
        'createdFilterDates',
        'currentTab',
        'customFilter',
        'dueFilterDates',
        'hideFilter',
        'jsonFilter',
        'jsonFilterSelectedCount',
        'maxFilterBookings',
        'maxSearchBookings',
        'partnerKey',
        'sortBy',
      ],

      bookingStateName: '',
      bookingStateRecords: [],
      jsonState: {},
      showSavedStateDrawer: false,

      bookingTabDrawerVisible: false,
      currentBooking: {},
      handlers: null,

      // Bulk edit fields
      bulkCommentSaving: false,
      rowSelection: true,
      saveBulkEnabled: false,
      selectedRowKeys: [],

      bookingsTableLoading: false,
      divisions: [],
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

  async componentDidMount() {

    this.props.changeHeader('hdd', 'BookingHub', [
      { name: 'Bookings Filter', url: '/bookings-filter/bookings' }
    ])

    await this.loadDataAndSetState()

  }

  componentWillUnmount() {
    // Cancel any un-resolved fetches, these are for
    // our custom ones...
    Object.keys(cancelTokens).forEach(key => {
      if(cancelTokens[key]) cancelTokens[key]()
    })

    // This is for our general fetches...
    this.actions.api.cancelFetches()

  }

  loadDataAndSetState = async() => {

    let { state } = this

    state.partnerKey = this.props.user.partnerKey

    // Give the user something to look at.
    this.setStateWithoutUpdate({currentTab: state.defaultTab})

    // Get this user's saved filters.
    state.bookingStateRecords = await this.actions.getBookingStatesForFilterView(
      this.props.user.userKey,
    )

    // Get the flags and flag colours from all divisions
    state.divisions = await this.actions.getCompiledFlagsFromAllDivisions()

    // Finally pass our state object into silentReload which will
    // load the actual bookings and set them to this.state
    await this.silentReload(state)

  }

  // █▀▀█ █▀▀█ █▀▀█ ▀█░█▀ ░▀░ █▀▀ ░▀░ █▀▀█ █▀▀▄ ░▀░ █▀▀▄ █▀▀▀
  // █░░█ █▄▄▀ █░░█ ░█▄█░ ▀█▀ ▀▀█ ▀█▀ █░░█ █░░█ ▀█▀ █░░█ █░▀█
  // █▀▀▀ ▀░▀▀ ▀▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀ ▀░░▀ ▀▀▀▀

  silentReload = async(state) => {

    // Reload all the bookings without showing any loading icons
    // so that the view can update silently if we recieve the 'Bookings' channel websocket event.

    if(!state) state = { ...this.state }

    const {
      jsonFilter
    } = state

    let newJsonFilter = await this.handleFilterOptions(jsonFilter)

    await this.setStateWithoutUpdate({
      filterLoading: false,
      jsonFilter: newJsonFilter,
    })

    // Done loading filter options

  }

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  getFilterOptionsWCancel = async() => {

    if(cancelTokens.filterOptions) cancelTokens.filterOptions()

    let config = {
      cancelToken: generateCancelToken('filterOptions') 
    }

    return API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/bookings/options/count`, { 
        jsonFilterOptions: this.state.jsonFilter
      }, config
    )

  }

  getFilterOptions = async (jsonFilter) => {

    const jsonFilterOptions = jsonFilter ? jsonFilter : []
    let result
    // KEEP: this is the most custom endpoint we have and will need proper time to convert (if we even need to).
    try {
      result = await API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/bookings/options/count`, {
        jsonFilterOptions
      })
    } catch (error) {
      console.log('error :', error)
      return null
    }
    // Sorry about this but for testing purposes the result here is an object with 'result' and 'queryString' on it.
    return result.result
  }

  getBookingsByParamsWCancel = async() => {

    if(cancelTokens.bookingsFiltered) cancelTokens.bookingsFiltered()

    let config = {
      cancelToken: generateCancelToken('bookingsFiltered')   
    }

    let res = await API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/bookings/sort/${this.state.sortBy}/0/${this.state.maxFilterBookings}/${this.state.ascOrDesc}`, {
        jsonFilterOptions: this.state.jsonFilter
    }, config)
    return res
  }

  getBookingsByParams = async (jsonFilterOptions, sortBy, start, end, ascOrDesc) => {
    let result
    // KEEP: custom endpoint
    try {
      result = await API.put(this.props.stage, `/bookingpublic2/key/${this.props.user.apiKey}/user/${this.props.user.userKey}/bookings/sort/${sortBy}/${start}/${end}/${ascOrDesc}`, {
        jsonFilterOptions
      })
    } catch (error) { 
      console.log('There was an error getting the bookings: ', error)
      return null
    }
    return result
  }

  getBookingsAndFilterParams = async (sort = 'created desc', where = []) => {
    let limit = []

    // if(typeof start === 'number' && typeof end === 'number' ) limit = [start, end]

    where = [
      ...where,
      ...this.helper.filterPausedBookings(),
      ...this.helper.makeAccessLevelWhere(this.props.user),
      // `bookingDivKey = "${this.props.bookingDivKey}"`,
    ]

    const result = await this.actions.getAllBookingsTableBookings(where, sort, limit)

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

  // █▀▀ ▀█░█▀ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // █▀▀ ░█▄█░ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

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

    let result = await this.actions.addStateRecordForFilterView(
      {
        bookingStateName: this.state.bookingStateName,
        userKey: this.props.user.userKey,
        jsonState,
      }
    )

    const bookingStateRecords = await this.actions.getBookingStatesForFilterView(
      this.props.user.userKey,
    )
    
    let showSavedStateDrawer = false
    let bookingStateName = ''

    this.setState({
      bookingStateRecords,
      bookingStateName,
      showSavedStateDrawer
    })

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

  handleGetBookingsByStatus = async(start, status, bookingDivKey) => {
    return await this.getBookingsAndFilterParams(
      [
        `currentStatus = "${status}"`
      ],
      start, 20
    )
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

  renderTotalValue = (dataIndex, bookings) => {
    if(!bookings || bookings.length === 0) return 0
    return bookings.reduce((num, booking) => {
      if(booking[dataIndex]) {
        return num + Number(booking[dataIndex])
      }
      return num
    }, 0).toFixed(2)
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

  mapFlagValuesFromDivisions = divisions => {

    return this.combineJsonFlagObjects(divisions).reduce((arr,item) => {

      if(arr.includes(item.value)) return arr
      return [...arr, item.value]

    }, [])
  }

  combineJsonFlagObjects = divisions => {

    // Take an array of divisions and compile all the jsonFlags objects
    // with the bookingdivKey they belong to in each one...

    return divisions.reduce((arr,div) => {

      return [
        ...arr, 
        ...div.jsonFlags.map(jFlag => (
          {...jFlag, bookingDivKey: div.bookingDivKey}
        ))
      ]

    }, [])
  }

  convertDivisionsToObject = divisions => {

    // Take an array of bookingDivision records and
    // return an object with the bookingDivKey as each key and
    // an array of jsonFlags as each value

    return divisions.reduce((obj, jFlag) => {

      obj[jFlag.bookingDivKey] = jFlag.jsonFlags

      return obj
    }, {})

  }

  extractJsonFlag = bookingDivKey => {
    return this.convertDivisionsToObject(this.state.divisions)[bookingDivKey]
  }

  renderFlag = (flag, bookingDivKey, i) => (
    <div
      key={i}
      style={{
        backgroundColor: this.flagColor(
          flag, 
          this.extractJsonFlag(bookingDivKey)
        ),
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

  flagColor = (flag, jsonFlags) => {
    if(!flag) return

    // const {division} = this.state

    let color = (colorPicker('template', 'colorLabel', (jsonFlags?.find(
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

    const columns = makeColumns({
      handleOpenBookingTabDrawer:  this.handleOpenBookingTabDrawer,
      handleTotalValue:            this.handleTotalValue,
      renderFlag:                  this.renderFlag,
    })

    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>

        <CustomFilterPanel>
        </CustomFilterPanel>

        {/*
          <Card style={{ minHeight: 943.12 }}>
            {
            <div>
            <FilteredBookingsTable
              onChangeTab={key => this.setState({ currentTab: key })}
              columns={columns}

              rowSelection={  this.rowSelection}

              bookings={                 this.state.bookings} 
              bookingsFiltered={         this.state.bookingsFiltered}
              bookingsTableLoading={     this.state.bookingsTableLoading}
              currentTab={               this.state.currentTab}
              filterLoading={            this.state.filterLoading}
              jsonFilterSelectedCount={  this.state.jsonFilterSelectedCount} 
              rowSelectionState={             this.state.rowSelection}
            >
            </FilteredBookingsTable>
                </div>
          }
            </Card>
            */}

        {/*
        <BulkEditDrawer
          selectedRowKeys={this.state.selectedRowKeys}
          api={this.props.api}
          apiKey={this.props.user.apiKey}
          flags={this.mapFlagValuesFromDivisions(this.state.divisions)}
          statuses={[ 'Draft','Live','In Progress','Complete' ]}
          save={this.handleSavebulk}
          createComment={this.handleSaveBulkComment}
          userAccessLevel={this.props.user.accessLevel}
          currentTab={this.state.currentTab}
          onClose={() => this.setState({selectedRowKeys: []})}
          visible={(this.state.selectedRowKeys || []).length > 0}
        >
        </BulkEditDrawer>
            */}

        {/*
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
            */}
        
      </Content>
    )
  }
}

export default connect(
  state => ({
    jsonFilter: state.jsonFilter
  })
)(BookingsFilter)
