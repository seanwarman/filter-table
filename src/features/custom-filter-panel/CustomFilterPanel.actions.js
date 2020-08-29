export const UPDATE_DATE_PARAMS = 'customFilterPanel/UPDATE_DATE_PARAMS'
export const REQUEST_JSON_FILTER = 'customFilterPanel/REQUEST_JSON_FILTER'
export const UPDATE_JSON_FILTER = 'customFilterPanel/UPDATE_JSON_FILTER'
export const UPDATE_FILTER_OPTION = 'customFilterPanel/UPDATE_FILTER_OPTION'
export const HIDE_FILTER = 'customFilterPanel/HIDE_FILTER'
export const UPDATE_FILTER_PARAMS = 'customFilterPanel/UPDATE_FILTER_PARAMS'
export const CLEAR_JSON_FILTER_OPTIONS = 'customFilterPanel/CLEAR_JSON_FILTER_OPTIONS'

export const updateJsonFilter = jsonFilter => ({
  type: UPDATE_JSON_FILTER,
  jsonFilter
})

export const clearJsonFilterOptions = () => ({
  type: CLEAR_JSON_FILTER_OPTIONS
})

export const selectFilterOption = (dataIndex, option, selected) => ({
  type: UPDATE_FILTER_OPTION,
  dataIndex, option, selected
})

export const hideFilter = () => ({
  type: HIDE_FILTER,
})

export const updateDateParams = (key, value) => ({
  type: UPDATE_DATE_PARAMS,
  key, value
})

export const updateFilterParams = (key, value) => ({
  type: UPDATE_FILTER_PARAMS,
  key, value
})

export const getJsonFilter = jsonFilter => ({
  type: REQUEST_JSON_FILTER
})
