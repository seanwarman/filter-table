import {
  SET_BOOKINGSTATE_RECORDS,
  UPDATE_SEARCH_TERM,
} from './BookingsFilter.actions'

const initialState = {
  searchTerm: '',
  bookingStateRecords: [],
}

export default function bookingsFilterReducer(state = initialState, action) {
  switch (action.type) {
    case SET_BOOKINGSTATE_RECORDS:
      return {
        ...state,
        bookingStateRecords: action.bookingStateRecords
      }
    case UPDATE_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.searchTerm
      }
    default:
      return state
  }

}
