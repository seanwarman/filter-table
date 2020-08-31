import Actions from '../../jsequel/bookings-filter/Actions'
import {
  reqFailed,
} from '../bookings-table/BookingsTable.actions'

export const SELECT_BOOKINGS_STATE = 'bookingsFilter/SELECT_BOOKINGS_STATE'
export const SET_BOOKINGSTATE_RECORDS = 'bookingsFilter/SET_BOOKINGSTATE_RECORDS'
export const UPDATE_SEARCH_TERM = 'bookingsFilter/UPDATE_SEARCH_TERM'

export const selectBookingState = jsonState => ({
  type: SELECT_BOOKINGS_STATE,
  jsonState
})

export const setBookingsStateRecords = bookingStateRecords => ({
  type: SET_BOOKINGSTATE_RECORDS,
  bookingStateRecords
})

export const updateSearchTerm = searchTerm => ({
  type: UPDATE_SEARCH_TERM,
  searchTerm
})

export const deleteBookingsState = bookingStateKey => async (dispatch, getState) => {

  const { apiKey, userKey } = getState().app.user

  const actions = new Actions(apiKey, userKey)

  try {
    await actions.deleteStateRecord(bookingStateKey)
  } catch (error) {
    console.log('There was an error deleting the bookingsState record: ', error)
    return dispatch(reqFailed(error))
  }

  dispatch(getStateRecords())

}

export const createBookingState = bookingStateName => async (dispatch, getState) => {

  const { apiKey, userKey } = getState().app.user

  const actions = new Actions(apiKey, userKey)

  const { customFilterPanel } = getState()

  try {
    await actions.addStateRecordForFilterView({
      userKey,
      bookingStateName,
      jsonState: customFilterPanel,
    })
  } catch (error) {
    console.log('There was an error creating the bookingsState record: ', error)
    return dispatch(reqFailed(error))
  }

  dispatch(getStateRecords())

}

export const getStateRecords = () => async (dispatch, getState) => {

  const { apiKey, userKey } = getState().app.user

  const actions = new Actions(apiKey, userKey)

  let bookingStateRecords

  try {
    bookingStateRecords = await actions.getBookingStatesByUser(userKey)
  } catch (error) {
    console.log('There was an error getting the bookingStateRecords: ', error)
    return dispatch(reqFailed(error))
  }

  if(bookingStateRecords.message) {
    console.log('There was an error getting the bookingStateRecords: ', bookingStateRecords.message)
    return dispatch(reqFailed(bookingStateRecords.message))
  }

  dispatch(setBookingsStateRecords(bookingStateRecords))

}
