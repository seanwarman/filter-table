import Actions from './jsequel/app/Actions'

import {
  reqFailed
} from './features/bookings-table/BookingsTable.actions'

export const CHANGE_HEADER = 'app/CHANGE_HEADER'
export const SET_DIVISIONS = 'app/SET_DIVISIONS'
export const REQUEST_DIVISIONS = 'app/REQUEST_DIVISIONS'

export const changeHeader = header => ({
  type: CHANGE_HEADER,
  header
})

export const setDivisions = divisions => ({
  type: SET_DIVISIONS,
  divisions
})

export const reqDivisions = () => ({
  type: REQUEST_DIVISIONS
})

export const getDivisions = () => async (dispatch, getState) => {

  dispatch(reqDivisions())

  const { apiKey, userKey } = getState().app.user

  const actions = new Actions(apiKey, userKey)

  let results

  try {
    results = await actions.getDivisions()
  } catch (error) {
    console.log('Failed to get divisions: ', error)
    return dispatch(reqFailed(error))
  }

  if(results.message) {
    console.log('Failed to get divisions: ', results.messages)
    return dispatch(reqFailed(results.message))
  }

  dispatch(setDivisions(results))

}
