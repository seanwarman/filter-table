import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import localStoreMiddleware from './localStoreMiddleware.js'
import bookingsFilterMiddleware from './features/bookings-filter/BookingFilter.middleware'
import reducer from './reducer'
const composeEnhancers = window.location.origin.includes('localhost') ?
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose) : compose

const store = createStore(
  reducer, 
  composeEnhancers(
    applyMiddleware(
      bookingsFilterMiddleware, // bookingsFilterMiddleware relies on 
                                // thunkMiddleware so I'm putting it in front
      localStoreMiddleware,
      thunkMiddleware,
    )
  )
)

export default store
