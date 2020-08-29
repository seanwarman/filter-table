import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default ({props: cProps, component: C, path: cPath}) => {
  return(
    <Route
      path={cPath}
      render={props =>
        cProps.user.accessLevel === 'Admin' ?
        <Redirect from="/" to="/console/customers" />
        :
        <Redirect from="/" to="/scribr/bookings" />
      }
    />
  );
}
