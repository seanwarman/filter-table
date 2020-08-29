import {
  REQUEST_JSON_FILTER,
  UPDATE_JSON_FILTER,
  UPDATE_FILTER_OPTION,
  UPDATE_FILTER_PARAMS,
  CLEAR_JSON_FILTER_OPTIONS,
  UPDATE_DATE_PARAMS,
  HIDE_FILTER,
} from './CustomFilterPanel.actions'

import {
  SELECT_BOOKINGS_STATE
} from '../bookings-filter/BookingsFilter.actions'

const initialState = {
  jsonFilter: [],
  jsonFilterSelectedCount: 0,
  completedFilterDates: [],
  createdFilterDates: [],
  dueFilterDates: [],
  ascOrDesc: 'asc',
  sortBy: 'dueDate',
  hideFilter: false,
  maxFilterBookings: 1000,
  filterLoading: false,
  disableFilterOptions: false,

  currentTab: 'Filter',
}

function setInitialState() {
  return JSON.parse(window.localStorage.getItem(
    'customFilterPanel'
  ) || JSON.stringify(initialState))
}

export default function customFilterPanelReducer(state = setInitialState(), action) {

  switch(action.type) {

    case SELECT_BOOKINGS_STATE:
      return {
        ...mapJsonStateToCustomFilterPanelState(state, action.jsonState),
        filterLoading: true,
      }
    case REQUEST_JSON_FILTER:
      return {
        ...state,
        filterLoading: true,
      }
    case UPDATE_DATE_PARAMS:
      return {
        ...state,
        [keyToDateParam(action.key)]: action.value,
        filterLoading: true,
        ...spreadJsonFilterAndCountToState(state, {
          dataIndex: action.key,
          option: action.value,
          selected: action.value?.length > 0
        }, 'date')
      }
    case UPDATE_FILTER_OPTION:
      return {
        ...state,
        filterLoading: true,
        ...spreadJsonFilterAndCountToState(state, action)
      }
    case CLEAR_JSON_FILTER_OPTIONS:
      return {
        ...state,
        ...initialState,
        filterLoading: true,
        jsonFilter: state.jsonFilter.map(j => ({
          ...j,
          options: j.options.map(opt => ({
            ...opt,
            selected: false
          }))
        }))
      }
    case UPDATE_JSON_FILTER:
      return {
        ...state,
        filterLoading: false,
        jsonFilter: reduceFilterOptions(action.jsonFilter, state.jsonFilter),
      }
    case HIDE_FILTER:
      return {
        ...state,
        hideFilter: !state.hideFilter
      }
    case UPDATE_FILTER_PARAMS:
      return {
        ...state,
        filterLoading: true,
        [action.key]: action.value
      }
    default:
      return state
  }

}

function mapJsonStateToCustomFilterPanelState(state, jsonState) {

  return Object.keys(state).reduce((s, key) => {

    if(jsonState[key]) return {
      ...s,
      [key]: jsonState[key]
    }

    return {
      ...s,
      [key]: state[key]
    }


  }, {})

}

function keyToDateParam(key) {
  return (

    key === 'created' ?
    'createdFilterDates'
    :
    key === 'dueDate' ?
    'dueFilterDates'
    :
    key === 'completedDate' &&
    'completedFilterDates'

  )
}

function spreadJsonFilterAndCountToState(state, action, type) {
  const jsonFilter = addSelectionAndCountToJsonFilter(state, action, type)
  return {
    jsonFilter,
    jsonFilterSelectedCount: countJsonFilterSelected(jsonFilter)
  }
}

function countJsonFilterSelected(jsonFilter) {
  return jsonFilter.reduce((num, json) => {
    return json.options.reduce((n, opt) => opt.selected ? n+1 : n, 0) + num
  }, 0)
}

function addSelectionAndCountToJsonFilter(state, action, type) {

  const { jsonFilter } = state
  const { dataIndex, option, selected } = action

  const newJsonFilter = jsonFilter.map(item => {
    if(item.dataIndex === dataIndex) {

      let options = []

      if(type === 'date') {
        options = [ { option, selected } ]
      } else {
        options = item.options.map(optionItm => optionItm.option !== option ? optionItm : {
          ...optionItm,
          selected
        })
      }

      return {
        ...item,
        options
      }
    }
    return item
  })

  return newJsonFilter
}

function reduceFilterOptions(newOptions, oldOptions) {
  return newOptions.reduce((arr,item) => {

    let {dataIndex, option, count, prettyName, type} = item

    let i = arr.findIndex(findItem => findItem.dataIndex === dataIndex)
    let selected = false
    let optionItem

    if(type !== 'date') {
      optionItem = (((oldOptions || []).find(optnItem => optnItem.dataIndex === dataIndex) || {}).options || [])
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
      optionItem = (oldOptions || []).find(optnItem => optnItem.dataIndex === dataIndex)

      if(optionItem) {
        return [...arr, { dataIndex, prettyName, type, options: optionItem.options }]
      } else {
        return [...arr, { dataIndex, prettyName, type, options: [] }]
      }
    }

    return arr
  },[])

}
