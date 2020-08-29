import appReducer from './App.reducer'
import customFilterPanelReducer from './features/custom-filter-panel/CustomFilterPanel.reducer'
import bookingsTableReducer from './features/bookings-table/BookingsTable.reducer'
import bookingsFilterReducer from './features/bookings-filter/BookingsFilter.reducer'

export default function reducer(state = {}, action) {
  return {
    app: appReducer(state.app, action),
    bookingsFilter: bookingsFilterReducer(state.bookingsFilter, action),
    customFilterPanel: customFilterPanelReducer(state.customFilterPanel, action),
    bookingsTable: bookingsTableReducer(state.bookingsTable, action),
  }
}
