import axios from 'axios'
import { API } from '../../libs/apiMethods'
import {
  SELECT_BOOKINGS_STATE,
} from './BookingsFilter.actions'

import {
  CLEAR_JSON_FILTER_OPTIONS,
  UPDATE_FILTER_OPTION,
  UPDATE_DATE_PARAMS,
  UPDATE_FILTER_PARAMS,
  REQUEST_JSON_FILTER,
  updateJsonFilter,
} from '../custom-filter-panel/CustomFilterPanel.actions'

import {
  BULK_FIELDS_SAVED,
  COMMENT_CREATED,
  updateBookings,
  reqCancelled,
} from '../bookings-table/BookingsTable.actions'

const CancelToken = axios.CancelToken

let cancelTokens = {
  bookingsFiltered: null,
  filterOptions: null
}

function generateCancelToken(type) {
  if(!type) throw new Error('There must be a type passed to generateCancelToken')
  return new CancelToken(c => cancelTokens[type] = c)
}

let jsonTimer,
    bookingsTimer


const customFilterPanelMiddleware = store => next => action => {

  next(action)

  if(
    action.type === CLEAR_JSON_FILTER_OPTIONS ||
    action.type === UPDATE_FILTER_OPTION ||
    action.type === UPDATE_DATE_PARAMS ||
    action.type === UPDATE_FILTER_PARAMS ||
    action.type === BULK_FIELDS_SAVED ||
    action.type === COMMENT_CREATED ||
    action.type === SELECT_BOOKINGS_STATE
  ) {
    console.log('bookingsThenFilter')
    bookingsThenFilter(next, store.getState)
  }

  if(
    action.type === REQUEST_JSON_FILTER
  ) {
    if(store.getState().customFilterPanel.jsonFilter.lenth > 0) {
      console.log('bookingsThenFilter')
      return bookingsThenFilter(next, store.getState)
    }
    console.log('filterThenBookings')
    filterThenBookings(next, store.getState)
  }


}

export async function bookingsThenFilter(dispatch, getState) {

  const { stage, user } = getState().app
  const { apiKey, userKey } = user

  const start = 0
  const {
    jsonFilter, 
    maxFilterBookings: end,
    sortBy,
    ascOrDesc
  } = getState().customFilterPanel


  let bookings

  try {
    bookings = await fetchBookingsByFilterOptions(stage, apiKey, userKey, sortBy, start, end, ascOrDesc, jsonFilter)
  } catch (error) {
    if(error.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the bookings by jsonFilter', error)
    if(bookingsTimer) clearTimeout(bookingsTimer)
    bookingsTimer = setTimeout(() => bookingsThenFilter(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(jsonFilterResult.message))
  }

  if(bookings.message) {
    if(bookings.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the bookings by jsonFilter', bookings.message)
    if(bookingsTimer) clearTimeout(bookingsTimer)
    bookingsTimer = setTimeout(() => bookingsThenFilter(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(jsonFilterResult.message))
  }

  dispatch(updateBookings(bookings))

  // -----------------------------------------------------------------------

  let jsonFilterResult

  try {
    jsonFilterResult = await fetchJsonFilter(stage, apiKey, userKey, jsonFilter)
  } catch (error) {
    if(error.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the jsonFilter options: ', error)
    if(jsonTimer) clearTimeout(jsonTimer)
    jsonTimer = setTimeout(() => bookingsThenFilter(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(jsonFilterResult.message))
  }

  if(jsonFilterResult.message) {
    if(jsonFilterResult.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the jsonFilter options: ', jsonFilterResult.message)
    if(jsonTimer) clearTimeout(jsonTimer)
    jsonTimer = setTimeout(() => bookingsThenFilter(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(jsonFilterResult.message))
  }

  dispatch(updateJsonFilter(jsonFilterResult.result))

}

export async function filterThenBookings(dispatch, getState) {

  const { stage, user } = getState().app
  const { apiKey, userKey } = user

  const {
    jsonFilter: firstJsonFilter, 
  } = getState().customFilterPanel

  let jsonFilterResult

  try {
    jsonFilterResult = await fetchJsonFilter(stage, apiKey, userKey, firstJsonFilter)
  } catch (error) {
    if(error.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the jsonFilter options: ', error)
    if(jsonTimer) clearTimeout(jsonTimer)
    jsonTimer = setTimeout(() => filterThenBookings(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(error))
  }

  if(jsonFilterResult.message) {
    if(jsonFilterResult.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the jsonFilter options: ', jsonFilterResult.message)
    if(jsonTimer) clearTimeout(jsonTimer)
    jsonTimer = setTimeout(() => filterThenBookings(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(jsonFilterResult.message))
  }

  dispatch(updateJsonFilter(jsonFilterResult.result))

  // -----------------------------------------------------------------------

  const start = 0
  const {
    jsonFilter: secondJsonFilter,
    maxFilterBookings: end,
    sortBy,
    ascOrDesc
  } = getState().customFilterPanel

  let bookings

  try {
    bookings = await fetchBookingsByFilterOptions(stage, apiKey, userKey, sortBy, start, end, ascOrDesc, secondJsonFilter)
  } catch (error) {
    if(error.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the bookings by jsonFilter', error)
    if(bookingsTimer) clearTimeout(bookingsTimer)
    bookingsTimer = setTimeout(() => filterThenBookings(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(jsonFilterResult.message))
  }

  if(bookings.message) {
    if(bookings.__CANCEL__) return dispatch(reqCancelled())
    console.log('There was an error getting the bookings by jsonFilter', bookings.message)
    if(bookingsTimer) clearTimeout(bookingsTimer)
    bookingsTimer = setTimeout(() => filterThenBookings(dispatch, getState), 1000)
    return
    // return dispatch(reqFailed(jsonFilterResult.message))
  }

  dispatch(updateBookings(bookings))

}

function fetchBookingsByFilterOptions(stage, apiKey, userKey, sortBy, start, end, ascOrDesc, jsonFilter) {

  if(cancelTokens.bookingsFiltered) cancelTokens.bookingsFiltered()

  let config = {
    cancelToken: generateCancelToken('bookingsFiltered')   
  }

  const useOptions = jsonFilter.find(json => json.options.find(opt => opt.selected))

  return  API.put(stage, `/custom/key/${apiKey}/user/${userKey}/bookings/sort/${sortBy}/${start}/${end}/${ascOrDesc}`, {
    jsonFilterOptions: useOptions ? jsonFilter : []
  }, config)

}

function fetchJsonFilter(stage, apiKey, userKey, jsonFilter) {

  if(cancelTokens.filterOptions) cancelTokens.filterOptions()

  const config = {
    cancelToken: generateCancelToken('filterOptions') 
  }

  return API.put(stage, `/custom/key/${apiKey}/user/${userKey}/bookings/options/count`, {
    jsonFilterOptions: jsonFilter
  }, config)
}

export default customFilterPanelMiddleware

