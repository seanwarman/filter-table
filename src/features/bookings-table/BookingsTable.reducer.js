import {
  SAVING_BULK_FIELDS,
  SET_UPLOADS,
  FETCHING_UPLOADS,
  SET_COMMENTS,
  FETCHING_COMMENTS,
  UPDATE_BOOKINGS,
  REQ_CANCELLED,
  SELECT_ROW_KEYS,
  REQ_FAILED,
  LOADING_CREATE_COMMENT,
} from './BookingsTable.actions'

import {
  SELECT_BOOKINGS_STATE,
} from '../bookings-filter/BookingsFilter.actions'

import {
  UPDATE_FILTER_OPTION,
  REQUEST_JSON_FILTER,
  CLEAR_JSON_FILTER_OPTIONS,
  UPDATE_DATE_PARAMS,
  UPDATE_FILTER_PARAMS,
} from '../custom-filter-panel/CustomFilterPanel.actions'

const initialState = {

  /*
  Default State
  */

  fetching: false,
  error: null,

  bookingsFiltered: [],
  bookingsTableLoading: false,
  currentTab: 'Filter',
  filterLoading: false,

  drawerWidth: 640,
  bookingsKeys: [],
  comments: [],
  fetchingComments: false,
  selectedRowKeys: [],
  loadingCreateComment: false,

  fileName: '',
  uploadReady: false,
  uploading: false,
  url: '',
  uploads: [],

  savingBulkFields: false,

}

function setInitialState() {
  return {
    ...initialState,
    ...JSON.parse(window.localStorage.getItem(
      'bookingsTable'
    ) || '{}')
  }
}


export default function bookingsTableReducer(state = setInitialState(), action) {

  switch(action.type) {

    case SELECT_BOOKINGS_STATE:
      return {
        ...state,
        bookingsTableLoading: true,
      }
    case SAVING_BULK_FIELDS:
      return {
        ...state,
        savingBulkFields: true,
      }
    case LOADING_CREATE_COMMENT:
      return {
        ...state,
        loadingCreateComment: true,
      }
    case FETCHING_COMMENTS:
      return {
        ...state,
        fetchingComments: true,
        loadingCreateComment: true,
      }
    case FETCHING_UPLOADS:
      return state
    case SET_UPLOADS:
      return {
        ...state,
        uploads: action.uploads
      }
    case SELECT_ROW_KEYS:
      return {
        ...state,
        selectedRowKeys: action.selectedRowKeys,
      }
    case SET_COMMENTS:
      return {
        ...state,
        fetchingComments: false,
        loadingCreateComment: false,
        comments: action.comments,
      }
    case UPDATE_BOOKINGS:
      return {
        ...state,
        bookingsFiltered: action.bookingsFiltered,
        selectedRowKeys: removeRowKeysNotIncludedInBookings(state.selectedRowKeys, action.bookingsFiltered),
        bookingsTableLoading: false,
        savingBulkFields: false,
        error: null,
      }
    case UPDATE_DATE_PARAMS:
      return {
        ...state,
        bookingsTableLoading: true,
        error: null,
      }
    case UPDATE_FILTER_PARAMS:
      return {
        ...state,
        bookingsTableLoading: true,
        error: null,
      }
    case UPDATE_FILTER_OPTION:
      return {
        ...state,
        bookingsTableLoading: true,
        error: null
      }
    case REQUEST_JSON_FILTER:
      return {
        ...state,
        bookingsTableLoading: true,
        error: null
      }
    case CLEAR_JSON_FILTER_OPTIONS:
      return {
        ...state,
        bookingsTableLoading: true,
        error: null,
      }
    case REQ_FAILED:
      return {
        ...state,
        fetchingComments: false,
        bookingsTableLoading: false,
        loadingCreateComment: false,
        error: action.error
      }
    case REQ_CANCELLED:
      return state
    default:
      return state
  }

}

function removeRowKeysNotIncludedInBookings(selectedRowKeys, bookingsFiltered) {

  return selectedRowKeys.filter(bookingsKey => {
    return bookingsFiltered.find(b => b.bookingsKey === bookingsKey)
  })

}
