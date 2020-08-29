import {
  UPDATE_DATE_PARAMS,
  UPDATE_FILTER_OPTION,
  CLEAR_JSON_FILTER_OPTIONS,
  UPDATE_JSON_FILTER,
  HIDE_FILTER,
  UPDATE_FILTER_PARAMS,
} from './features/custom-filter-panel/CustomFilterPanel.actions'

import {
  SELECT_BOOKINGS_STATE,
} from './features/bookings-filter/BookingsFilter.actions'

import {
  SELECT_ROW_KEYS
} from './features/bookings-table/BookingsTable.actions'

const localStoreMiddleware = store => next => action => {

  next(action)

  if(
    action.type === UPDATE_DATE_PARAMS ||
    action.type === UPDATE_FILTER_OPTION ||
    action.type === CLEAR_JSON_FILTER_OPTIONS ||
    action.type === UPDATE_JSON_FILTER ||
    action.type === UPDATE_FILTER_PARAMS ||
    action.type === HIDE_FILTER ||
    action.type === SELECT_BOOKINGS_STATE
  ) {
    window.localStorage.setItem(
      'customFilterPanel',
      JSON.stringify(store.getState().customFilterPanel)
    )
  }

  if (
    action.type === SELECT_ROW_KEYS
  ) {
    const { selectedRowKeys } = store.getState().bookingsTable
    window.localStorage.setItem(
     'bookingsTable',
      JSON.stringify({
        selectedRowKeys
      })
    )
  }


}

export default localStoreMiddleware
