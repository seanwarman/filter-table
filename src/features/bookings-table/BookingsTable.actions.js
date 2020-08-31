import Actions from '../../jsequel/bookings-table/Actions'

export const COMMENT_CREATED = 'bookingsTable/COMMENT_CREATED'
export const LOADING_CREATE_COMMENT = 'bookingsTable/LOADING_CREATE_COMMENT'
export const SELECT_ROW_KEYS = 'bookingsTable/SELECT_ROW_KEYS'
export const SET_COMMENTS = 'bookingsTable/SET_COMMENTS'
export const SET_UPLOADS = 'bookingsTable/SET_UPLOADS'
export const FETCHING_UPLOADS = 'bookingsTable/FETCHING_UPLOADS'
export const FETCHING_COMMENTS = 'bookingsTable/FETCHING_COMMENTS'
export const LOADING_BOOKINGS = 'bookingsTable/LOADING_BOOKINGS'
export const UPDATE_BOOKINGS = 'bookingsTable/UPDATE_BOOKINGS'
export const REQ_CANCELLED = 'bookingsTable/REQ_CANCELLED'
export const REQ_FAILED = 'bookingsTable/REQ_FAILED'
export const SAVING_BULK_FIELDS = 'bookingsTable/SAVING_BULK_FIELDS'
export const BULK_FIELDS_SAVED = 'bookingsTable/BULK_FIELDS_SAVED'

export const setComments = comments => ({
  type: SET_COMMENTS,
  comments
})

export const setUploads = uploads => ({
  type: SET_UPLOADS,
  uploads
})

export const fetchingUploads = () => ({
  type: FETCHING_UPLOADS
})

export const fetchingComments = () => ({
  type: FETCHING_COMMENTS,
})

export const loadingBookings = () => ({
  type: LOADING_BOOKINGS,
})

export const reqCancelled = () => ({
  type: REQ_CANCELLED
})

export const reqFailed = error => ({
  type: REQ_FAILED,
  error
})

export const selectRowKeys = selectedRowKeys => dispatch => {
  dispatch({
    type: SELECT_ROW_KEYS,
    selectedRowKeys
  })

  if(selectedRowKeys.length > 0) dispatch(fetchComments(selectedRowKeys))
}

export const updateBookings = bookingsFiltered => (dispatch, getState) => {

  dispatch({
    type: UPDATE_BOOKINGS,
    bookingsFiltered
  })

  const { selectedRowKeys } = getState().bookingsTable
  if(selectedRowKeys.length > 0) dispatch(fetchComments(selectedRowKeys))

}

export const saveBulkFields = fields => async (dispatch, getState) => {

  dispatch({
    type: SAVING_BULK_FIELDS,
  })

  const { apiKey, userKey } = getState().app.user
  const { selectedRowKeys } = getState().bookingsTable

  const actions = new Actions(apiKey, userKey)

  try {
    await actions.updateBookings(fields, selectedRowKeys)
  } catch (error) {
    console.log('There was an error fetching the result: ', error)
    return dispatch(reqFailed(error))
  }

  dispatch({
    type: BULK_FIELDS_SAVED
  })

  // bookingsThenFilter(dispatch, getState)

}

export const handleSaveUpload = uploaderState => async (dispatch, getState) => {

//   let s3Url = 'https://s3-eu-west-1.amazonaws.com/bms-uploads-bucket/public/'

//   const { selectedRowKeys, bookingsFiltered } = getState().bookingsTable
//   const { userKey, apiKey } = getState().app.user

//   const actions = new Actions(apiKey, userKey)

//   let s3UrlName

//   try {
//     s3UrlName = await s3Upload(uploaderState.file)
//   } catch (err) {
//     console.log('There was an error uploading to the s3: ', err)
//     return dispatch(reqFailed(err))
//   }

//   const upload = {
//     urlName: sanitiseString(s3Url + s3UrlName),
//     uploadedUserKey: this.props.user.userKey,
//     customerKey: this.props.booking.customerKey,
//     // bookingsKey: this.props.booking.bookingsKey,
//     fileName: sanitiseString(uploaderState.fileName),
//   }

//   for await (const bookingsKey of selectedRowKeys) {

//     const booking = bookingsFiltered.find(b => b.bookingsKey === bookingsKey)
//     if(!booking) continue

//     const { bookingDivKey } = booking

//     let result

//     try {
//       result = await actions.createUpload({
//         ...upload,
//         bookingsKey,
//       }, bookingDivKey)
//     } catch (error) {
//       console.log('There was an error creating an upload record: ', error)
//       dispatch(reqFailed(error))
//     }

//     if(!result) {
//       message.error('There was an error saving you\'re url.')
//     } else {
//       message.success('Url saved!')
//     }

//   }

}

export const fetchUploads = () => async (dispatch, getState) => {
  dispatch(fetchingUploads())

  const { apiKey, userKey } = getState().app.user
  const { selectedRowKeys } = getState().bookingsTable

  const actions = new Actions(apiKey, userKey)

  let result

  try {
    result = await actions.getUploadsByBookingsKeys(selectedRowKeys)
  } catch (error) {
    console.log('There was an error fetching the comments: ', error)
    return dispatch(reqFailed(error))
  }

  if(result?.message) {
    console.log('There was an error fetching the comments: ', result.message)
    return dispatch(reqFailed(result.message))
  }

  return dispatch(setUploads(result))

}

export const createComment = comment => async (dispatch, getState) => {

  dispatch({
    type: LOADING_CREATE_COMMENT,
  })

  const { apiKey, userKey } = getState().app.user
  const { selectedRowKeys } = getState().bookingsTable

  const actions = new Actions(apiKey, userKey)

  try {
    await actions.createCommentsByBookingsKeys(selectedRowKeys, {
      comment,
      createdUserKey: userKey
    })
  } catch (error) {
    console.log('There was an error fetching the result: ', error)
    return dispatch(reqFailed(error))
  }

  dispatch(({
    type: COMMENT_CREATED
  }))

  dispatch(fetchComments(selectedRowKeys))

  // bookingsThenFilter(dispatch, getState)

}

export const fetchComments = selectedRowKeys => async (dispatch, getState) => {

  dispatch(fetchingComments())

  const { apiKey, userKey } = getState().app.user

  const actions = new Actions(apiKey, userKey)

  let comments

  try {
    comments = await actions.getCommentsByBookingsKeys(selectedRowKeys)
  } catch (error) {
    console.log('There was an error fetching the comments: ', error)
    return dispatch(reqFailed(error))
  }

  if(comments?.message) {
    console.log('There was an error fetching the comments: ', comments.message)
    return dispatch(reqFailed(comments.message))
  }

  return dispatch(setComments(comments))

}
