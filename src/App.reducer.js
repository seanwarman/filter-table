import {
  CHANGE_HEADER,
  REQUEST_DIVISIONS,
  SET_DIVISIONS,
} from './App.actions'

export default function appReducer(state = {

  header: [],
  user: {
    apiKey: 'e242d961-98c2-11e9-af48-c3fbaea4c686',
    userKey: 'be1a9270-a949-11e9-9e98-6fefd095aa2c'
  },
  stage: 'dev',

  error: null,
  fetching: false,
  divisions: [],
  flags: [],

}, action) {
  switch (action.type) {
    case CHANGE_HEADER:
      return {
        ...state,
        header: action.header
      }
    case REQUEST_DIVISIONS:
      return {
        ...state,
        fetching: true,
        error: null,
      }
    case SET_DIVISIONS:
      return {
        ...state,
        divisions: action.divisions,
        flags: parseFlagsFromDivisions(action.divisions),
        fetching: false,
        error: null,
      }
    default:
      return state
  }
}

function parseFlagsFromDivisions(divisions = []) {

  return divisions.reduce((flags, div) => {

    if(!div.jsonFlags) return flags

    const jsonFlags = div.jsonFlags.reduce((arr, flag) => {
      if(flags.find(f => f.value === flag.value)) return arr
      return [
        ...arr,
        flag
      ]
    }, [])

    return [
      ...flags,
      ...jsonFlags
    ]

  }, [])

}


