import React from 'react'
import { Route, Switch } from 'react-router-dom'
import NotFound from './components/NotFound'

import BookingsFilter from './features/bookings-filter/BookingsFilter'

export default childProps => {
  return (
    <Switch>

      <Route
        exact
        path="/"
        render={props => {
          return <BookingsFilter changeHeader={childProps.changeHeader}></BookingsFilter>
        }}
      ></Route>

      <Route path="/notfound" component={NotFound} />

      <Route component={NotFound} />
    </Switch>
  )
}
